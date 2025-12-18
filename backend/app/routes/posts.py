# backend/app/routes/posts.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas.post import PostCreate, PostResponse, PostUpdate
from models.post import Post
from services.cloudinary_service import CloudinaryService
from dependencies.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/posts", tags=["posts"])

@router.post("/", response_model=PostResponse)
def create_post(
    text: str,
    media_file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    media_url = None
    media_type = None
    
    if media_file:
        # Upload to Cloudinary
        upload_result = CloudinaryService.upload_media(media_file)
        media_url = upload_result["url"]
        media_type = upload_result["resource_type"]
    
    # Create post
    db_post = Post(
        text=text,
        media_url=media_url,
        media_type=media_type,
        user_id=current_user.id
    )
    
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    # Add owner username to response
    db_post.owner_username = current_user.username
    return db_post

@router.get("/", response_model=List[PostResponse])
def get_all_posts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    posts = db.query(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add owner usernames
    for post in posts:
        post.owner_username = post.owner.username
    
    return posts

@router.get("/my-posts", response_model=List[PostResponse])
def get_my_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    posts = db.query(Post).filter(
        Post.user_id == current_user.id
    ).order_by(Post.created_at.desc()).all()
    
    for post in posts:
        post.owner_username = current_user.username
    
    return posts

@router.get("/{post_id}", response_model=PostResponse)
def get_post(
    post_id: int,
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post.owner_username = post.owner.username
    return post

@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    post_update: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_post = db.query(Post).filter(Post.id == post_id).first()
    
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if db_post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    
    # Update fields
    for field, value in post_update.dict(exclude_unset=True).items():
        setattr(db_post, field, value)
    
    db_post.owner_username = current_user.username
    db.commit()
    db.refresh(db_post)
    return db_post

@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_post = db.query(Post).filter(Post.id == post_id).first()
    
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if db_post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    # Delete media from Cloudinary if exists
    if db_post.media_url and "res.cloudinary.com" in db_post.media_url:
        # Extract public_id from URL (simplified)
        import re
        match = re.search(r'/([^/]+)\.(jpg|jpeg|png|gif|mp4|mov|avi)$', db_post.media_url)
        if match:
            public_id = match.group(1)
            CloudinaryService.delete_media(public_id)
    
    db.delete(db_post)
    db.commit()
    return {"message": "Post deleted successfully"}