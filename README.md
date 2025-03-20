Project Overview
The Task Management System is a full-stack web application built with the MERN stack (MongoDB, Express.js, React, Node.js). It allows users to create, manage, and track tasks with features like role-based access control, and task history tracking. The application supports three user roles: admin, manager, and user, each with distinct permissions.

Frontend: A React application with Material-UI for a responsive and modern UI, hosted on Vercel.
Backend: An Express.js API with MongoDB for data storage, deployed on Vercel, integrated with Cloudinary for file uploads.
Key Features:
User authentication (login/register) with JWT.
Task CRUD operations (create, read, update, delete).
File attachments (optional) for tasks, stored on Cloudinary.
Role-based access: Admins manage all, managers assign tasks, users view their tasks.
Task filtering by status, priority, and assignee.
User Management to create or delete a user.

Installation and Setup Instructions
Prerequisites
Node.js: v16.x or higher
MongoDB: Local instance or MongoDB Atlas
Vercel CLI: For deployment
Cloudinary Account: For file storage
Git: For version control

Backend Setup

1. Clone the Repository:
   git clone https://github.com/HassaanMujtaba/task-softmind.git
   cd task-softmind/backend

2. Install Dependencies:
   npm install

3. Environment Variables
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/task-management
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

4. Run Locally:
   npm run dev

Frontend Setup:

1. Navigate to Frontend:
   cd ../frontend

2. Install Dependencies:
   npm install

3. Environment Variables:
   REACT_APP_API_URL=http://localhost:5000/api

4. Run Locally
   npm start

API Documentation
Base URL
Local: http://localhost:5000/api
Production: https://task-softmind-backend.vercel.app/api
Authentication
POST /api/users/login
Body: { "email": "user@example.com", "password": "password123" }
Response: { \_id, name, email, role, token }
Status: 200 (success), 401 (invalid credentials)
POST /api/users
Body: { "name": "John Doe", "email": "john@example.com", "password": "password123", "role": "user" }
Response: { \_id, name, email, role, token }
Status: 201 (created), 400 (user exists)
Tasks
POST /api/tasks
Headers: Authorization: Bearer <token>
Body: FormData with { title, description, assignedTo, status, priority, dueDate, attachments (optional files) }
Response: Task object
Status: 201 (created), 400 (validation error), 401 (unauthorized)
Access: Admin, Manager
GET /api/tasks
Headers: Authorization: Bearer <token>
Query: ?status=<status>&priority=<priority>&assignedTo=<id>
Response: [Task objects]
Status: 200 (success), 401 (unauthorized)
PUT /api/tasks/:id
Headers: Authorization: Bearer <token>
Body: FormData with updated fields and optional attachments
Response: Updated task object
Status: 200 (success), 404 (not found), 401 (unauthorized)
DELETE /api/tasks/:id
Headers: Authorization: Bearer <token>
Response: { message: "Task deleted" }
Status: 200 (success), 404 (not found), 401 (unauthorized)
Users
GET /api/users
Headers: Authorization: Bearer <token>
Response: { success: true, users: [User objects] }
Status: 200 (success), 403 (access denied), 401 (unauthorized)
Access: Admin (sees users, managers), Manager (sees users)

License Information

MIT License

Copyright (c) 2025 [Your Name or Organization]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
