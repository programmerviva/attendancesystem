# Attendance System - Render Deployment Guide

## Deployment Steps

### 1. Create a Render Account
- Sign up at [render.com](https://render.com)

### 2. Deploy Backend Service
- Click "New" and select "Web Service"
- Connect your GitHub repository
- Configure the service:
  - Name: attendance-system-api
  - Root Directory: server
  - Runtime: Node
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Add environment variables from .env.production

### 3. Deploy Frontend Service
- Click "New" and select "Static Site"
- Connect your GitHub repository
- Configure the service:
  - Name: attendance-system-client
  - Root Directory: client
  - Build Command: `npm install && npm run build`
  - Publish Directory: dist
  - Add environment variable: VITE_API_URL=https://your-backend-url

### 4. Connect Services
- After both services are deployed, update the VITE_API_URL in the frontend service to point to your backend URL
- Update the CLIENT_URL in the backend service to point to your frontend URL

## Important Notes
- Make sure MongoDB Atlas allows connections from Render's IP addresses
- Secure your environment variables in the Render dashboard
- Set NODE_ENV to production for both services