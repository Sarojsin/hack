# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
import re

class UserBase(BaseModel):
    username: str
    phone_number: str

class UserCreate(UserBase):
    password: str
    national_id: str
    
    @validator('phone_number')
    def validate_phone(cls, v):
        # Basic phone validation (adjust for your country)
        if not re.match(r'^\+?1?\d{9,15}$', v):
            raise ValueError('Invalid phone number format')
        return v
    
    @validator('national_id')
    def validate_national_id(cls, v):
        # Add national ID validation logic based on your country
        if len(v) < 5:
            raise ValueError('National ID must be at least 5 characters')
        return v

class UserLogin(BaseModel):
    phone_number: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    
    class Config:
        orm_mode = True