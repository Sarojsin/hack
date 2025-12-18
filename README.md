# Community Help Application

Community Help is a platform designed to empower people to report and prioritize local issues. By sharing problems and ranking their urgency, the community can work together to bring attention to the most critical needs.

## 🚀 Features

- **User Authentication**: Secure signup and login system.
- **Problem Reporting**: Users can create posts with text and media (images/videos).
- **Urgency Ranking**: A community-driven ranking system to prioritize issues (Low, Medium, High).
- **Personal Dashboard**: Track and manage your own reported problems.
- **Dynamic Prioritization**: Posts are categorized and sorted based on community feedback.

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework for APIs.
- **SQLAlchemy & PostgreSQL**: Robust database management and ORM.
- **Passlib & PBKDF2**: Secure password hashing and protection.
- **Python-Jose**: JWT-based secure authentication.
- **Cloudinary**: Media storage and management.

### Frontend
- **Vanilla HTML/CSS/JS**: Lightweight and fast frontend implementation.
- **FontAwesome**: Modern iconography.
- **Fetch API**: Seamless frontend-backend communication.

## 📁 Project Structure

```text
├── backend/app/        # FastAPI Application
│   ├── models/         # Database models
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic
│   └── utils/          # Security & helpers
├── frontend/           # Static web files
│   ├── css/            # Stylesheets
│   └── js/             # Frontend logic (API, Auth, Posts)
├── database_setup.sql  # Database initialization script
└── .env                # Environment configuration
```

## 📄 Documentation

- [Setup Guide](setup.md) - Detailed instructions on how to install and run the application.
- [Walkthrough](https://github.com/Sarojsin/hack/blob/main/walkthrough.md) - Overview of recent fixes and implementation details.

---
Built with ❤️ for the Community.
