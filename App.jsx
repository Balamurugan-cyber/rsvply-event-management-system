import React, { useState, useEffect } from 'react';
import { Calendar, Users, Download, Filter, Plus, ExternalLink, CheckCircle, XCircle, Clock, Sparkles, TrendingUp, Mail, MessageSquare, BarChart3, Zap, LogIn, LogOut, UserPlus, User, Lock } from 'lucide-react';

// Utility Functions
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const exportToCSV = (data, filename) => {
  const headers = ['Name', 'Email', 'RSVP Status', 'Meal Preference', 'Message', 'Sentiment', 'Timestamp'];
  const rows = data.map(guest => [
    guest.name,
    guest.email,
    guest.status,
    guest.mealPreference || 'N/A',
    guest.message || 'N/A',
    guest.sentiment || 'N/A',
    new Date(guest.timestamp).toLocaleString()
  ]);
  
  const csv = [headers, ...rows].map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// AI-Powered Sentiment Analysis
const analyzeSentiment = (message) => {
  if (!message) return { label: 'Neutral', score: 0.5, emoji: '😐' };
  
  const positive = ['excited', 'happy', 'great', 'wonderful', 'love', 'amazing', 'perfect', 'looking forward', 'can\'t wait', 'thrilled'];
  const negative = ['sorry', 'unfortunately', 'can\'t make', 'sad', 'regret', 'unable', 'missed'];
  
  const msgLower = message.toLowerCase();
  const posCount = positive.filter(word => msgLower.includes(word)).length;
  const negCount = negative.filter(word => msgLower.includes(word)).length;
  
  if (posCount > negCount) return { label: 'Positive', score: 0.8, emoji: '😊' };
  if (negCount > posCount) return { label: 'Negative', score: 0.2, emoji: '😔' };
  return { label: 'Neutral', score: 0.5, emoji: '😐' };
};

const generateResponseSuggestions = (eventName, sentiment) => {
  const suggestions = {
    Positive: [
      `Thank you for your enthusiasm! We're excited to see you at ${eventName}!`,
      `Your positive energy is contagious! Can't wait to celebrate together.`,
      `We appreciate your excitement! It's going to be an amazing event.`
    ],
    Negative: [
      `We're sorry you can't make it. We'll miss you at ${eventName}.`,
      `Thank you for letting us know. We hope to see you at our next event!`,
      `We understand and appreciate you taking the time to respond.`
    ],
    Neutral: [
      `Thank you for your response! Looking forward to ${eventName}.`,
      `We've received your RSVP. See you there!`,
      `Thanks for confirming! We'll be in touch with more details soon.`
    ]
  };
  
  return suggestions[sentiment] || suggestions.Neutral;
};

// Main App Component
export default function RSVPly() {
  const [view, setView] = useState('login');
  const [userType, setUserType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [guests, setGuests] = useState({});
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [users, setUsers] = useState({});

  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem('rsvply_events') || '[]');
    const savedGuests = JSON.parse(localStorage.getItem('rsvply_guests') || '{}');
    const savedUsers = JSON.parse(localStorage.getItem('rsvply_users') || '{}');

    // If there are no users saved, seed demo organizer and guest accounts
    if (!savedUsers || Object.keys(savedUsers).length === 0) {
      const demoUsers = {
        'organizer_organizer@demo.com': {
          email: 'organizer@demo.com',
          password: 'demo123',
          name: 'Demo Organizer',
          type: 'organizer'
        },
        'guest_guest@demo.com': {
          email: 'guest@demo.com',
          password: 'demo123',
          name: 'Demo Guest',
          type: 'guest'
        }
      };
      localStorage.setItem('rsvply_users', JSON.stringify(demoUsers));
      setUsers(demoUsers);
    } else {
      setUsers(savedUsers);
    }

    setEvents(savedEvents);
    setGuests(savedGuests);
  }, []);

  useEffect(() => {
    localStorage.setItem('rsvply_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('rsvply_guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem('rsvply_users', JSON.stringify(users));
  }, [users]);

  const handleLogin = (email, password, type) => {
    const userKey = `${type}_${email}`;
    if (users[userKey] && users[userKey].password === password) {
      setCurrentUser({ email, name: users[userKey].name, type });
      setUserType(type);
      setView('home');
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const handleSignup = (email, password, name, type) => {
    const userKey = `${type}_${email}`;
    if (users[userKey]) {
      return { success: false, error: 'User already exists' };
    }
    const newUsers = { ...users, [userKey]: { email, password, name, type } };
    setUsers(newUsers);
    setCurrentUser({ email, name, type });
    setUserType(type);
    setView('home');
    return { success: true };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    setView('login');
    setCurrentEvent(null);
  };

  const createEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: generateId(),
      slug: generateSlug(eventData.name),
      createdAt: Date.now(),
      organizerEmail: currentUser.email
    };
    setEvents([...events, newEvent]);
    setCurrentEvent(newEvent);
    setView('dashboard');
  };

  const addGuest = (eventId, guestData) => {
    const sentiment = analyzeSentiment(guestData.message);
    const newGuest = {
      ...guestData,
      id: generateId(),
      timestamp: Date.now(),
      sentiment: sentiment.label,
      sentimentScore: sentiment.score,
      guestEmail: currentUser?.email || guestData.email
    };
    setGuests({
      ...guests,
      [eventId]: [...(guests[eventId] || []), newGuest]
    });
  };

  const renderView = () => {
    if (view === 'login') {
      return <LoginPage onLogin={handleLogin} onSignup={handleSignup} />;
    }

    if (!currentUser) {
      return <LoginPage onLogin={handleLogin} onSignup={handleSignup} />;
    }

    switch(view) {
      case 'create':
        return <EventCreationForm onSubmit={createEvent} onCancel={() => setView('home')} />;
      case 'dashboard':
        return <Dashboard 
          event={currentEvent} 
          guests={guests[currentEvent?.id] || []} 
          onBack={() => setView('home')}
          showAIPanel={showAIPanel}
          setShowAIPanel={setShowAIPanel}
          currentUser={currentUser}
        />;
      case 'rsvp':
        return <RSVPForm 
          event={currentEvent} 
          onSubmit={(data) => {
            addGuest(currentEvent.id, data);
            setView('rsvp-success');
          }} 
          onBack={() => setView('home')}
          currentUser={currentUser}
        />;
      case 'rsvp-success':
        return <RSVPSuccess onBack={() => setView('home')} />;
      case 'my-rsvps':
        return <MyRSVPs 
          events={events} 
          guests={guests} 
          currentUser={currentUser} 
          onBack={() => setView('home')}
          onViewEvent={(event) => {
            setCurrentEvent(event);
            setView('rsvp');
          }}
        />;
      default:
        return <Home 
          events={events} 
          onCreateEvent={() => setView('create')} 
          onViewDashboard={(event) => {
            setCurrentEvent(event);
            setView('dashboard');
          }} 
          onViewRSVP={(event) => {
            setCurrentEvent(event);
            setView('rsvp');
          }}
          onViewMyRSVPs={() => setView('my-rsvps')}
          userType={userType}
          currentUser={currentUser}
          onLogout={handleLogout}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {renderView()}
    </div>
  );
}

// Login/Signup Page
function LoginPage({ onLogin, onSignup }) {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('organizer');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    if (!isLogin && !formData.name) {
      setError('Name is required');
      return;
    }

    const result = isLogin 
      ? onLogin(formData.email, formData.password, userType)
      : onSignup(formData.email, formData.password, formData.name, userType);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">RSVPly</h1>
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-xs font-semibold">
              <Sparkles size={12} />
              AI-Powered
            </div>
          </div>
          <p className="text-gray-600">Smart Event Management with AI-Driven Insights</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setUserType('organizer')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                userType === 'organizer'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <User className="inline mr-2" size={18} />
              Organizer
            </button>
            <button
              onClick={() => setUserType('guest')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                userType === 'guest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="inline mr-2" size={18} />
              Guest
            </button>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-all ${
                  isLogin ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-all ${
                  !isLogin ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg"
            >
              {isLogin ? (
                <>
                  <LogIn className="inline mr-2" size={18} />
                  Login
                </>
              ) : (
                <>
                  <UserPlus className="inline mr-2" size={18} />
                  Sign Up
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            {userType === 'organizer' ? (
              <p>Organizers can create and manage events</p>
            ) : (
              <p>Guests can RSVP to events and manage their responses</p>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="mb-2">Demo Credentials:</p>
          <div className="bg-white rounded-lg p-4 text-left">
            <p className="font-medium mb-1">Organizer:</p>
            <p className="text-xs text-gray-500">Email: organizer@demo.com | Password: demo123</p>
            <p className="font-medium mb-1 mt-3">Guest:</p>
            <p className="text-xs text-gray-500">Email: guest@demo.com | Password: demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Home Component - ORGANIZER & GUEST VIEWS
function Home({ events, onCreateEvent, onViewDashboard, onViewRSVP, onViewMyRSVPs, userType, currentUser, onLogout }) {
  const userEvents = userType === 'organizer' 
    ? events.filter(e => e.organizerEmail === currentUser.email)
    : events;

  // Organizer View
  if (userType === 'organizer') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-5xl font-bold text-gray-900">RSVPly</h1>
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-semibold">
                <Sparkles size={14} />
                AI-Powered
              </div>
            </div>
            <p className="text-xl text-gray-600">Welcome back, {currentUser.name}!</p>
            <p className="text-sm text-purple-600 font-medium">Organizer Dashboard</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <button
          onClick={onCreateEvent}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg mb-8"
        >
          <Plus size={20} />
          Create New Event
        </button>

        {userEvents.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                  <div className="space-y-2 text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span className="text-sm">{event.venue}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewDashboard(event)}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    View Dashboard
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Yet</h3>
            <p className="text-gray-600 mb-6">Create your first event to get started!</p>
          </div>
        )}
      </div>
    );
  }

  // Guest View
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex justify-between items-start mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-5xl font-bold text-gray-900">RSVPly</h1>
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-semibold">
              <Sparkles size={14} />
              AI-Powered
            </div>
          </div>
          <p className="text-xl text-gray-600">Welcome, {currentUser.name}!</p>
          <p className="text-sm text-blue-600 font-medium">Guest Access</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onViewMyRSVPs}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
          >
            <CheckCircle size={18} />
            My RSVPs
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {events.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                <div className="space-y-2 text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span className="text-sm">{event.venue}</span>
                  </div>
                </div>
                {event.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
                )}
                <button
                  onClick={() => onViewRSVP(event)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  RSVP to Event
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Available</h3>
          <p className="text-gray-600">Check back later for upcoming events!</p>
        </div>
      )}
    </div>
  );
}
// My RSVPs Component (for guests)
function MyRSVPs({ events, guests, currentUser, onBack, onViewEvent }) {
  const myRSVPs = events.map(event => {
    const eventGuests = guests[event.id] || [];
    const myResponse = eventGuests.find(g => g.guestEmail === currentUser.email);
    return myResponse ? { ...event, myResponse } : null;
  }).filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <button onClick={onBack} className="text-purple-600 hover:text-purple-700 mb-6 flex items-center gap-2">
        ← Back to Home
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">My RSVPs</h2>

        {myRSVPs.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">You haven't RSVPed to any events yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRSVPs.map(event => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {event.venue}
                      </div>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    event.myResponse.status === 'Attending' ? 'bg-green-100 text-green-700' :
                    event.myResponse.status === 'Not Attending' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {event.myResponse.status}
                  </span>
                </div>
                
                {event.myResponse.mealPreference && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Meal:</span> {event.myResponse.mealPreference}
                  </p>
                )}
                
                {event.myResponse.message && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium">Your message:</span> "{event.myResponse.message}"
                  </p>
                )}

                <button
                  onClick={() => onViewEvent(event)}
                  className="mt-4 text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Update RSVP →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Event Creation Form
function EventCreationForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    venue: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Event name is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
    
    const selectedDate = new Date(formData.date);
    if (selectedDate < new Date()) newErrors.date = 'Date must be in the future';
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Create New Event</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
              placeholder="Summer Team Gathering"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className={`w-full px-4 py-3 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue *
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({...formData, venue: e.target.value})}
              className={`w-full px-4 py-3 border ${errors.venue ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
              placeholder="Central Park, NYC"
            />
            {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="Tell your guests about the event..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium shadow-lg"
            >
              Create Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// RSVP Form
function RSVPForm({ event, onSubmit, onBack, currentUser }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    status: '',
    mealPreference: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.status) newErrors.status = 'Please select your RSVP status';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <button onClick={onBack} className="text-purple-600 hover:text-purple-700 mb-6 flex items-center gap-2">
        ← Back
      </button>
      
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{event.name}</h2>
          <div className="space-y-2 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span>{event.venue}</span>
            </div>
          </div>
          {event.description && (
            <p className="mt-4 text-gray-700">{event.description}</p>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={currentUser?.type === 'guest'}
              className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${currentUser?.type === 'guest' ? 'bg-gray-100' : ''}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={currentUser?.type === 'guest'}
              className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${currentUser?.type === 'guest' ? 'bg-gray-100' : ''}`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Will you attend? *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'Attending', label: 'Attending', icon: CheckCircle, color: 'green' },
                { value: 'Not Attending', label: 'Not Attending', icon: XCircle, color: 'red' },
                { value: 'Maybe', label: 'Maybe', icon: Clock, color: 'yellow' }
              ].map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({...formData, status: option.value})}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.status === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className={`mx-auto mb-2 ${formData.status === option.value ? `text-${option.color}-600` : 'text-gray-400'}`} size={24} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.status && <p className="text-red-500 text-sm mt-2">{errors.status}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Preference (Optional)
            </label>
            <select
              value={formData.mealPreference}
              onChange={(e) => setFormData({...formData, mealPreference: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="">Select preference</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Gluten-Free">Gluten-Free</option>
              <option value="No Preference">No Preference</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message to Organizer (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              placeholder="Any questions or special requests?"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium shadow-lg text-lg"
          >
            Submit RSVP
          </button>
        </div>
      </div>
    </div>
  );
}

// RSVP Success
function RSVPSuccess({ onBack }) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">RSVP Submitted!</h2>
        <p className="text-gray-600 mb-8">Thank you for your response. The organizer has been notified.</p>
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

// AI Insights Panel
function AIInsightsPanel({ guests, event }) {
  const sentimentStats = {
    positive: guests.filter(g => g.sentiment === 'Positive').length,
    negative: guests.filter(g => g.sentiment === 'Negative').length,
    neutral: guests.filter(g => g.sentiment === 'Neutral').length
  };

  const topMessages = guests
    .filter(g => g.message && g.sentiment === 'Positive')
    .slice(0, 3);

  const predictions = {
    attendance: Math.round((guests.filter(g => g.status === 'Attending').length / Math.max(guests.length, 1)) * 100),
    engagement: Math.round(((sentimentStats.positive / Math.max(guests.length, 1)) * 100)),
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={24} />
          <h3 className="text-xl font-bold">AI Insights</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-purple-100">Predicted Attendance</span>
            <span className="text-2xl font-bold">{predictions.attendance}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-100">Guest Engagement</span>
            <span className="text-2xl font-bold">{predictions.engagement}%</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-purple-600" />
          <h3 className="font-bold text-gray-900">Sentiment Analysis</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-2">
              😊 Positive
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{width: `${(sentimentStats.positive / Math.max(guests.length, 1)) * 100}%`}}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-900 w-8">{sentimentStats.positive}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-2">
              😐 Neutral
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-400 h-2 rounded-full" 
                  style={{width: `${(sentimentStats.neutral / Math.max(guests.length, 1)) * 100}%`}}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-900 w-8">{sentimentStats.neutral}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-2">
              😔 Negative
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{width: `${(sentimentStats.negative / Math.max(guests.length, 1)) * 100}%`}}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-900 w-8">{sentimentStats.negative}</span>
            </div>
          </div>
        </div>
      </div>

      {topMessages.length > 0 && (
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={20} className="text-purple-600" />
            <h3 className="font-bold text-gray-900">Top Positive Messages</h3>
          </div>
          <div className="space-y-3">
            {topMessages.map((guest, idx) => (
              <div key={idx} className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700 italic">"{guest.message}"</p>
                <p className="text-xs text-gray-500 mt-1">— {guest.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Mail size={20} className="text-purple-600" />
          <h3 className="font-bold text-gray-900">AI Response Suggestions</h3>
        </div>
        <div className="space-y-2">
          {generateResponseSuggestions(event.name, 'Positive').slice(0, 2).map((suggestion, idx) => (
            <div key={idx} className="bg-purple-50 p-3 rounded-lg text-sm text-gray-700 border border-purple-200">
              {suggestion}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard({ event, guests, onBack, showAIPanel, setShowAIPanel, currentUser }) {
  const [filterStatus, setFilterStatus] = useState('All');

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.status === 'Attending').length,
    notAttending: guests.filter(g => g.status === 'Not Attending').length,
    maybe: guests.filter(g => g.status === 'Maybe').length
  };

  const filteredGuests = filterStatus === 'All' 
    ? guests 
    : guests.filter(g => g.status === filterStatus);

  const handleExport = () => {
    exportToCSV(guests, `${event.slug}-rsvps.csv`);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <button onClick={onBack} className="text-purple-600 hover:text-purple-700 mb-6 flex items-center gap-2">
        ← Back to Events
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h2>
                <div className="space-y-1 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{event.venue}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                    showAIPanel 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  <Zap size={18} />
                  AI Insights
                </button>
                <button
                  onClick={handleExport}
                  disabled={guests.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">{stats.attending}</div>
                <div className="text-sm text-gray-600">Attending</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600 mb-1">{stats.notAttending}</div>
                <div className="text-sm text-gray-600">Declined</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.maybe}</div>
                <div className="text-sm text-gray-600">Maybe</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Guest List</h3>
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="All">All Guests</option>
                  <option value="Attending">Attending</option>
                  <option value="Not Attending">Not Attending</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>
            </div>

            {filteredGuests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No guests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                      <th className="pb-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="pb-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="pb-3 px-4 text-sm font-semibold text-gray-700">Sentiment</th>
                      <th className="pb-3 px-4 text-sm font-semibold text-gray-700">Meal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGuests.map((guest, idx) => (
                      <tr key={guest.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                        <td className="py-4 px-4 text-gray-900 font-medium">{guest.name}</td>
                        <td className="py-4 px-4 text-gray-600">{guest.email}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            guest.status === 'Attending' ? 'bg-green-100 text-green-700' :
                            guest.status === 'Not Attending' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {guest.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            guest.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                            guest.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {guest.sentiment === 'Positive' ? '😊' : guest.sentiment === 'Negative' ? '😔' : '😐'}
                            {guest.sentiment}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{guest.mealPreference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {showAIPanel && (
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <AIInsightsPanel guests={guests} event={event} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}// Continue with other components in next message...