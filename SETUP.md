# RSVPly Full Stack Setup Guide

Complete setup instructions for running the RSVPly application with React frontend and Node/MongoDB backend.

## Project Structure

```
007/
├── src/                    # React frontend
│   ├── components/        # Separated React components
│   ├── utils/
│   │   ├── api.js         # API client
│   │   └── helpers.js     # Utility functions
│   └── App.jsx
├── backend/               # Express backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth middleware
│   ├── utils/             # Backend helpers
│   ├── server.js          # Main server
│   ├── package.json
│   └── .env
├── vite.config.js
└── package.json
```

## Prerequisites

Before starting, ensure you have:
- Node.js v14+ 
- npm or yarn
- MongoDB (local or Atlas account)
- A code editor (VS Code recommended)

## Step 1: Install Frontend Dependencies

```bash
cd "c:\Users\balam\OneDrive\Desktop\007"
npm install
```

## Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

Backend will install: express, mongoose, dotenv, cors, bcryptjs, jsonwebtoken, nodemon

## Step 3: Set Up MongoDB

### Option A: Local MongoDB (Windows)

1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Run the installer
3. Start MongoDB:
   - In Command Prompt: `mongod`
   - MongoDB will run on `mongodb://localhost:27017`

### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (free tier M0)
4. Get connection string (click "Connect")
5. Copy connection string and update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rsvply?retryWrites=true&w=majority
   ```

## Step 4: Configure Environment Variables

### Backend (.env file already created)
File: `backend/.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rsvply
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
NODE_ENV=development
```

Update `JWT_SECRET` to something secure in production.

## Step 5: Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Backend server running on http://localhost:5000
```

## Step 6: Start the Frontend (New Terminal)

```bash
cd "c:\Users\balam\OneDrive\Desktop\007"
npm run dev
```

Frontend will run on `http://localhost:3001`

## Step 7: Update Frontend to Use Backend (Optional)

The frontend is currently set to use localStorage. To enable backend API usage, modify your components to use the API client:

Example in `src/App.jsx`:
```javascript
import { apiClient } from './utils/api';

// Instead of localStorage, use API
const handleLogin = async (email, password, type) => {
  try {
    const response = await apiClient.auth.login(email, password, type);
    apiClient.setToken(response.token);
    setCurrentUser(response.user);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

## Verification Checklist

- [ ] MongoDB is running (check `mongodb://localhost:27017`)
- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:3001`
- [ ] No console errors in either terminal
- [ ] Backend health check: `curl http://localhost:5000/health`

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  type: "organizer" | "guest",
  createdAt: Date
}
```

### Events Collection
```javascript
{
  _id: ObjectId,
  name: String,
  date: Date,
  venue: String,
  description: String,
  slug: String (unique),
  organizerId: ObjectId (ref: User),
  organizerEmail: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Guests Collection
```javascript
{
  _id: ObjectId,
  eventId: ObjectId (ref: Event),
  name: String,
  email: String,
  guestEmail: String,
  status: "Attending" | "Not Attending" | "Maybe",
  mealPreference: String,
  message: String,
  sentiment: "Positive" | "Neutral" | "Negative",
  sentimentScore: Number,
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Common Issues & Fixes

### Port Already in Use
If port 5000 is in use:
1. Change `PORT=5000` to `PORT=5001` in `backend/.env`
2. Restart backend: `npm run dev`

### MongoDB Connection Failed
```
error: connect ECONNREFUSED
```
- Ensure MongoDB is running: `mongod`
- Or use MongoDB Atlas cloud version

### CORS Errors in Console
- Ensure backend is running on correct port
- Check `backend/server.js` CORS configuration
- Frontend and backend must have matching origin

### Frontend Shows "Connecting to Backend"
- Verify backend URL in `src/utils/api.js` matches your backend port
- Check network tab in DevTools for API calls

## API Testing with Postman

1. Download Postman from https://www.postman.com/downloads/
2. Import collection or manually test endpoints:

**Signup Request:**
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "organizer@test.com",
  "password": "password123",
  "name": "Test Organizer",
  "type": "organizer"
}
```

**Login Request:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "organizer@test.com",
  "password": "password123",
  "type": "organizer"
}
```

Copy the returned `token` and use in Authorization header for protected routes.

## Next Steps

1. ✅ Backend created with MongoDB
2. ✅ API client created for frontend
3. **TODO**: Update React components to use API client instead of localStorage
4. **TODO**: Add error handling for API calls
5. **TODO**: Add loading states
6. **TODO**: Deploy to production (Heroku, Railway, or Render)

## Support & Documentation

- MongoDB: https://docs.mongodb.com/
- Express: https://expressjs.com/
- Mongoose: https://mongoosejs.com/
- JWT: https://jwt.io/
- Vite: https://vitejs.dev/

## Production Checklist

Before deploying:
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas instead of local
- [ ] Enable HTTPS
- [ ] Set up proper CORS for production domain
- [ ] Add rate limiting
- [ ] Add request validation
- [ ] Set up error logging
- [ ] Add input sanitization
