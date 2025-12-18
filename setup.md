# Setup Guide

Follow these steps to set up and run the Community Help application on your local machine.

## Prerequisites

- **Python 3.8+**
- **PostgreSQL** installed and running.
- **Node.js** (optional, for running `live-server`).

---

## 1. Backend Setup

### Create Virtual Environment
```bash
python -m venv venv
```

### Activate Virtual Environment
- **Windows**: `venv\Scripts\activate`
- **Mac/Linux**: `source venv/bin/activate`

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Database Setup
1. Create a database named `community_help` in PostgreSQL.
2. Run the initialization script:
   ```bash
   psql -U postgres -d community_help -f database_setup.sql
   ```

### Configuration
Create a `.env` file in the root directory (use the template provided in the project):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/community_help
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Run the Backend
```bash
cd backend/app
python main.py
```
The API will be available at `http://localhost:8000`. You can view the Documentation at `http://localhost:8000/docs`.

---

## 2. Frontend Setup

### Option A: Using Live-Server (Recommended)
```bash
npm install -g live-server
cd frontend
live-server --port=5500
```

### Option B: Manual
Simply open `frontend/login.html` in your web browser. Note that some features might require a local server to handle redirects properly.

---

## 3. Usage
1. Open the frontend at `http://localhost:5500`.
2. Sign up for a new account.
3. Log in with your phone number and password.
4. Start reporting community problems and ranking them!
