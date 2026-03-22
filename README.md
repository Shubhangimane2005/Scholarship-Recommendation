# Scholarship Application - Complete Setup Guide

A full-stack scholarship management application with student/parent signup, login, scholarship browsing, applications, and an admin dashboard.

## Features

- ✅ Student & Parent Signup & Login
- ✅ Browse Scholarships (Senior KG to Master's)
- ✅ Filter by Education Level & Caste (Open, SC, ST, NT, OBC)
- ✅ Apply for Scholarships
- ✅ Email Notifications
- ✅ Multilingual Chatbot (English, Hindi, Marathi)
- ✅ Voice Recognition Support
- ✅ Admin Dashboard with User Logs
- ✅ **Neon Database (PostgreSQL)** - Cloud database

---

## Prerequisites

Before running the project, make sure you have:

1. **Node.js** - Download from https://nodejs.org (LTS version)
2. **Neon Database Account** - Sign up at https://neon.tech (free)
3. **Code Editor** - VS Code recommended

---

## Step 1: Set Up Neon Database

1. Go to https://neon.tech and sign up for free
2. Create a new project called "scholarship_app"
3. Copy your connection string (it will look like):
   
```
   postgresql://username:password@host.neon.tech/scholarship_app?sslmode=require
   
```
4. Replace the values in `backend/.env` with your Neon credentials

---

## Step-by-Step Installation

### Step 1: Extract the Project

Extract the scholarship-application.zip file to your desired location.

### Step 2: Install Backend Dependencies

Open terminal/command prompt in the project folder:

```
bash
cd backend
npm install
```

This will install:
- express (web server)
- pg (PostgreSQL client for Neon)
- bcryptjs (password encryption)
- jsonwebtoken (authentication)
- nodemailer (emails)
- cors, body-parser, dotenv

### Step 3: Install Frontend Dependencies

```
bash
cd frontend
npm install
```

This will install React and all required packages.

### Step 4: Configure Environment Variables

Edit the `backend/.env` file with your Neon connection string:

```
DATABASE_URL=postgresql://your-username:your-password@your-host.neon.tech/scholarship_app?sslmode=require
JWT_SECRET=scholarship_secret_key_2024
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=5000
```

**Note for Email:**
- If using Gmail, you need an App Password
- Go to Google Account → Security → 2-Step Verification → App Passwords
- Generate a new app password and use it in EMAIL_PASS

---

## How to Run the Project

### Step 1: Start Backend Server

Open a terminal:

```
bash
cd backend
npm start
```

You should see:
```
Server running on port 5000
PostgreSQL Connected
Database tables initialized
Default scholarships seeded
Default admin created: admin@scholarship.gov / admin123
```

### Step 2: Start Frontend

Open a new terminal:

```
bash
cd frontend
npm start
```

This will open the application at http://localhost:3000

---

## How to Use the Application

### For Students/Parents:

1. **Sign Up**: Click "Sign Up" → Fill details → Select "Student" or "Parent" role
2. **Login**: Use your email and password
3. **Browse Scholarships**: View all scholarships or filter by level/caste
4. **Apply**: Click "Apply Now" on any scholarship → Fill application form
5. **My Applications**: View your submitted applications
6. **Chatbot**: Click the chat icon for scholarship help (supports Hindi, Marathi, English)

### For Admin:

1. **Admin Login**: Go to http://localhost:3000/admin
2. **Credentials**:
   - Email: admin@scholarship.gov
   - Password: admin123
3. **Dashboard**: View:
   - Total Users
   - Total Applications
   - Pending Applications
   - All User Logs (who logged in, applied, viewed forms)

---

## Scholarship Categories

The app includes scholarships for:

| Level | Description |
|-------|-------------|
| Senior KG | For Senior Kindergarten students |
| Junior KG | For Junior Kindergarten students |
| 1st to 10th | Primary and Secondary education |
| 11th - 12th | Higher Secondary |
| Diploma | Technical diploma courses |
| Graduate | Bachelor's degree |
| Post Graduate | Master's degree |
| Master | Advanced Master's |

### Caste Categories:
- Open (General)
- SC (Scheduled Caste)
- ST (Scheduled Tribe)
- NT (Nomadic Tribe)
- OBC (Other Backward Class)

---

## Troubleshooting

### Issue: "npm is not recognized"
**Solution**: Restart your terminal or add Node.js to PATH

### Issue: "Database connection failed"
**Solution**: 
- Check your Neon connection string in .env
- Make sure your Neon project is active
- Verify sslmode=require is at the end of the URL

### Issue: "Port 3000 is already in use"
**Solution**: 
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Email not working"
**Solution**: 
- Use a valid Gmail account with App Password
- OR disable 2-step verification (not recommended)

---

## Project Structure

```
scholarship-application/
├── backend/
│   ├── package.json
│   ├── server.js          # Main backend code (PostgreSQL/Neon)
│   └── .env              # Environment variables (Neon URL)
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js      # React entry
│       ├── App.js        # Main component
│       ├── index.css     # Styles
│       └── components/
│           ├── Signup.js
│           ├── Login.js
│           ├── Scholarships.js
│           ├── ApplicationForm.js
│           ├── MyApplications.js
│           ├── AdminLogin.js
│           ├── AdminDashboard.js
│           └── Chatbot.js
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Student/Parent signup |
| POST | /api/auth/login | Student/Parent login |
| POST | /api/auth/admin/login | Admin login |
| GET | /api/scholarships | Get all scholarships |
| GET | /api/scholarships/:id | Get single scholarship |
| POST | /api/applications | Submit application |
| GET | /api/applications/my | Get user's applications |
| GET | /api/admin/users | Get all users (admin) |
| GET | /api/admin/applications | Get all applications (admin) |
| GET | /api/admin/logs | Get all logs (admin) |
| GET | /api/admin/stats | Get dashboard stats |

---

## Why Neon?

- **Free Tier**: Generous free plan for development
- **Serverless**: No server management needed
- **Automatic Scaling**: Handles traffic automatically
- **GitHub Integration**: Easy to connect with your repos

---

## Support

If you face any issues, check:
1. Neon database is active and running
2. Connection string is correct in .env
3. All npm install completed without errors
4. Ports 3000 and 5000 are available

---

**Happy Learning! 🎓**
