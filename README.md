# SkillForge - Online Learning Platform

## Project Overview
SkillForge is a comprehensive online learning platform built with React that enables users to access courses, manage learning content, and track progress. The platform includes separate interfaces for administrators, teachers, and students.

## Project Structure
```
Source/
└── SkillForge/
    ├── backend/
    ├── frontend/
    ├── firebase.json
    ├── package-lock.json
    ├── package.json
    └── render.yaml
```

## Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)
- Internet connection for package installation

## Installation and Setup

### Option 1: Run Locally

#### Step 1: Navigate to the Backend Directory
```bash
cd Source/SkillForge
cd backend
```

#### Step 2: Install Backend Dependencies
```bash
npm i
```
Note: You may see some deprecation warnings during installation. These can be safely ignored for development purposes.

#### Step 3: Start the Backend Server
```bash
npm start
```
The backend server will start running at: http://localhost:3002

Expected output:
- Server is running at http://localhost:3002
- Serving uploads from the backend/uploads/audio directory

#### Step 4: Navigate to the Frontend Directory
Open a new terminal window and run:
```bash
cd Source/SkillForge
cd frontend
```

#### Step 5: Install Frontend Dependencies
```bash
npm i
```

#### Step 6: Start the Frontend Application
```bash
npm start
```
The application will automatically open in your browser at:
- Local: http://localhost:3001
- Network: http://192.168.1.3:3001

### Option 2: Access Deployed Version (Recommended)

Simply visit the deployed application at:
**https://skill-94f02.web.app/**

No installation required!

## Available Test Accounts

### Admin Account
- Email: admin@gmail.com
- Password: 12345678
- Access: Full administrative privileges

### User Account
- Email: thuykhanh1209@gmail.com
- Password: 12345678
- Access: Student/learner interface

### Teacher Account
- Email: Anna@gmail.com
- Password: 12345678
- Access: Teacher interface
## Features

### Authentication & Account Management
- Register new student or teacher accounts
- Login with Email/Password authentication
- Login with Google OAuth
- Secure logout functionality
- Change password
- Edit account information and update personal profile

### User Administration
- Assign and modify user roles and permissions
- Activate, deactivate, or suspend user accounts
- Manage user status across the system

### Learning Goals & Placement
- Take placement test to determine proficiency level
- Set target IELTS band and preferred skills
- Update learning goals and objectives as needed

### AI-Powered Assessment
- Submit speaking tasks with audio/video for AI evaluation
- Submit writing tasks (Task 1/Task 2) for AI scoring
- AI scoring for speaking (Fluency, Pronunciation, Grammar, Vocabulary)
- AI scoring for writing (Task Achievement, Coherence, Vocabulary, Grammar)
- AI analysis for Listening/Reading with mistake pattern explanations
- View detailed breakdown of AI scoring results

### Exercise Management
- Browse exercises prioritized by weak skills
- Filter exercises by skill, question type, difficulty, and duration
- Search for exercises by keyword or topic
- Take full IELTS mock tests for all skills
- Submit test answers for automatic scoring
- View detailed test feedback and reports

### Personalization & History
- AI-generated exercise recommendations based on weaknesses
- Like exercises to refine personalization algorithm
- Skip exercises not wanted for study
- View history of completed tests and exercises

### Live Teaching Sessions
- Schedule speaking lessons with teachers
- Teachers can manage availability and appointments
- Join video lessons via WebRTC
- Real-time feedback during live sessions
- Automatic session recording
- Playback previous lesson recordings

### Teacher Features
- View student progress, scores, and weaknesses
- Upload learning materials and custom content
- Manage teaching schedules

### Admin Dashboard
- Access overview of users and system activity
- Upload and organize IELTS practice content
- Approve, remove, or update teacher accounts
- View system statistics and analytics on user activity and performance trends

## Technology Stack
- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: Firebase
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Styling**: CSS

## Security Notes
- Some npm packages may show vulnerability warnings during installation
- For production use, run `npm audit fix` to address security issues
- Keep dependencies updated regularly

## Troubleshooting

### Backend Issues
If the backend fails to start:
1. Ensure port 3002 is not in use by another application
2. Check if all environment variables are properly configured in .env file
3. Verify Node.js version compatibility

### Frontend Issues
If the frontend fails to start:
1. Ensure port 3001 is not in use
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Connection Issues
If frontend cannot connect to backend:
1. Verify backend is running on port 3002
2. Check firewall settings
3. Ensure correct API endpoint configuration

## Development Notes
- The development build is not optimized
- To create a production build, run: `npm run build`
- Backend serves audio files from the uploads/audio directory
- Environment variables are loaded via dotenv

## Support
For issues or questions about the project, please contact the development team.

## License
This project is part of an Information Technology Project course.
Project ID: 522H0053_522H0055

---
Last Updated: January 2026
