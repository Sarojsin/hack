# backend/app/services/cloudinary_service.py
import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

class CloudinaryService:
    @staticmethod
    def upload_media(file: UploadFile, folder: str = "community_posts"):
        try:
            # Check file type
            content_type = file.content_type
            if content_type.startswith('image/'):
                resource_type = 'image'
            elif content_type.startswith('video/'):
                resource_type = 'video'
            else:
                raise HTTPException(status_code=400, detail="Invalid file type")
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                file.file,
                resource_type=resource_type,
                folder=folder
            )
            
            return {
                "url": upload_result["secure_url"],
                "public_id": upload_result["public_id"],
                "resource_type": resource_type
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    @staticmethod
    def delete_media(public_id: str):
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
        except Exception as e:
            print(f"Error deleting media: {e}")
            return False