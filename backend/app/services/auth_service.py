# backend/app/services/auth_service.py
from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate
from utils.security import get_password_hash, verify_password, create_access_token
from datetime import timedelta

class AuthService:
    @staticmethod
    def create_user(db: Session, user: UserCreate):
        # Check if user exists
        existing_user = db.query(User).filter(
            (User.username == user.username) | 
            (User.phone_number == user.phone_number)
        ).first()
        
        if existing_user:
            raise ValueError("Username or phone number already exists")
        
        # Create new user
        db_user = User(
            username=user.username,
            phone_number=user.phone_number,
            hashed_password=get_password_hash(user.password),
            national_id=user.national_id
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, phone_number: str, password: str):
        user = db.query(User).filter(User.phone_number == phone_number).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def create_user_token(user: User):
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}