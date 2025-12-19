# Running the Community Help App

Follow these steps to get the application running on your local machine.

## 1. Database Setup
1. Ensure **PostgreSQL** is running.
2. Create a database named `community_help`.
3. Run the initialization script:
   ```bash
   psql -U postgres -d community_help -f database_setup.sql
   ```

## 2. Configuration (.env)
Ensure you have a `.env` file in the **root directory** with these variables:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/community_help
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 3. Backend Startup
1. Activate the virtual environment:
   - **Windows**: `venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`
2. Install dependencies (if not already done):
   ```bash
   pip install -r requirements.txt
   pip install python-jose[cryptography] passlib[bcrypt]
   ```
3. Run the server:
   ```bash
   cd backend/app
   python main.py
   ```
   *The API will be at http://localhost:8000. Docs at http://localhost:8000/docs*

## 4. Frontend Startup
1. Open a new terminal.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Run the development server:
   ```bash
   npx live-server --port=5500
   ```
   *Access the app at http://127.0.0.1:5500*

## 5. Test Credentials
You can use the following user for testing:
- **Phone Number**: `+9999999999`
- **Password**: `testpassword123`

---
> [!TIP]
> **Technical Note**: The backend has been updated to use `Annotated` for robust form parsing and absolute path detection for `.env` loading. Always start the backend from the `backend/app` directory or use `python backend/app/main.py` from the root.
