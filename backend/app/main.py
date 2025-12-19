# backend/app/main.py
import os
from dotenv import load_dotenv

# Load env variables before anything else
# Root directory is two levels up from backend/app
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(os.path.dirname(BASE_DIR))
load_dotenv(os.path.join(ROOT_DIR, ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, posts, rankings
import uvicorn

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Community Help App", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(rankings.router)

@app.get("/")
def read_root():
    return {"message": "Community Help App API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)