# RSVPly - Modern Event Management Platform

A modern, full-stack event management and RSVP tracking application built with React, Express.js, and MongoDB.

## ✨ Features

- 📅 **Event Management** - Create, edit, and manage events with ease
- ✉️ **RSVP Tracking** - Track guest responses and manage attendance
- 🤖 **AI Insights** - Get intelligent analytics on your events and guests
- 🔐 **Secure Authentication** - JWT-based authentication with bcrypt hashing
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- ⚡ **Modern Architecture** - Context API, custom hooks, and component-based structure

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd 007
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Setup environment variables**
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:5000/api

# Backend (backend/.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rsvply
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Running the Application

**Terminal 1 - Start Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Start Frontend**
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/              # Reusable components (Button, Input, Card, etc)
│   ├── forms/               # Form components (LoginForm, SignupForm, etc)
│   └── layout/              # Layout components (Header, Footer, Layout)
├── pages/                   # Page components (Home, Dashboard, etc)
├── context/                 # Context API (AuthContext, EventContext)
├── hooks/                   # Custom hooks (useForm, useGuests)
├── services/                # API service layer
├── utils/                   # Utility functions
├── constants/               # Constants and configuration
├── styles/                  # Global styles
├── App.jsx                  # Main App component with routing
├── main.jsx                 # Entry point
└── index.css                # Global CSS

backend/
├── models/                  # MongoDB schemas
├── routes/                  # API routes
├── middleware/              # Auth middleware
├── utils/                   # Backend utilities
├── server.js                # Main server file
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Events
- `POST /api/events` - Create event
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Guests/RSVP
- `POST /api/guests/:eventId` - Add RSVP
- `GET /api/guests/:eventId` - List event guests
- `PUT /api/guests/:guestId` - Update guest RSVP
- `DELETE /api/guests/:guestId` - Delete guest
- `GET /api/guests/:eventId/analytics` - Get event analytics

## 🏗️ Architecture

### Frontend Architecture
- **React 18** with Vite for fast development
- **React Router v6** for client-side routing
- **Context API** for state management
- **Custom Hooks** for logic extraction
- **Tailwind CSS** for styling
- **Component-based** architecture with separation of concerns

### Backend Architecture
- **Express.js** for HTTP server
- **MongoDB + Mongoose** for database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Middleware-based** request handling
- **RESTful** API design

## 🎨 UI Components

### Common Components
- `Button` - Reusable button with variants
- `Input` - Text input with validation
- `Card` - Container component
- `Alert` - Alert messages
- `LoadingSpinner` - Loading state

### Form Components
- `LoginForm` - User login
- `SignupForm` - User registration
- `EventForm` - Event creation/editing
- `RSVPForm` - RSVP submission

### Layout Components
- `Header` - Navigation and branding
- `Footer` - Footer with links
- `Layout` - Main layout wrapper

## 🔐 Authentication

- User registration with email and password
- Login with JWT token generation
- Token stored in localStorage
- Protected routes with ProtectedRoute component
- Automatic logout on token expiration

## 📝 Scripts

### Frontend
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

### Backend
```bash
npm run dev     # Start with nodemon
npm start       # Start production server
```

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Backend Deployment (Railway/Render)
1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables
4. Deploy

## 🛠️ Technologies Used

- **Frontend**: React 18, Vite, React Router, Tailwind CSS
- **Backend**: Express.js, Node.js, MongoDB
- **Database**: MongoDB, Mongoose ODM
- **Authentication**: JWT, bcryptjs

---

**Status**: ✅ Production Ready  
**Version**: 2.0.0  
**Last Updated**: December 4, 2025
