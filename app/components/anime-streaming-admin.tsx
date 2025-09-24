import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Star, Heart, Bell, User, Settings, History, BookOpen, Filter, Moon, Sun, Menu, X, ChevronDown, ChevronRight, Eye, Clock, Calendar, Users, MessageCircle, Share2, Download, Bookmark, ThumbsUp, Home, Tv, Grid, List, Plus, Edit, Trash2, Upload, Save, UserCheck, Shield, Database, BarChart } from 'lucide-react';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = "779631712094-6t77ptt5366r218o80pmijmeelboj25g.apps.googleusercontent.com";
const ADMIN_EMAIL = "hanzgantengno1@gmail.com";

// Router implementation
const Router = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return React.Children.map(children, child => 
    React.cloneElement(child, { currentPath, navigate })
  );
};

// Mock data - In production, this would come from API/Database
const [mockAnimeData, setMockAnimeData] = useState([
  {
    id: 1,
    title: "Attack on Titan Final Season",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    rating: 9.2,
    year: 2024,
    status: "Ongoing",
    genre: ["Action", "Drama", "Fantasy"],
    episodes: 24,
    description: "The final battle for humanity begins as Eren's true intentions are revealed.",
    studio: "MAPPA",
    views: "12.5M",
    trailer: "https://example.com/trailer.mp4",
    createdAt: "2024-01-15",
    updatedAt: "2024-03-20"
  },
  {
    id: 2,
    title: "Demon Slayer: Infinity Castle",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    rating: 8.9,
    year: 2024,
    status: "Completed",
    genre: ["Action", "Supernatural", "Historical"],
    episodes: 12,
    description: "Tanjiro faces his greatest challenge in the mysterious Infinity Castle.",
    studio: "Ufotable",
    views: "8.3M",
    createdAt: "2024-02-01",
    updatedAt: "2024-03-15"
  },
  {
    id: 3,
    title: "Jujutsu Kaisen Season 3",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
    rating: 8.7,
    year: 2024,
    status: "Ongoing",
    genre: ["Action", "School", "Supernatural"],
    episodes: 24,
    description: "The Culling Game arc brings unprecedented danger to the jujutsu world.",
    studio: "MAPPA",
    views: "15.2M",
    createdAt: "2024-01-10",
    updatedAt: "2024-03-18"
  }
]);

// Theme Context
const ThemeContext = React.createContext();

const AnimeStreamingApp = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [animeData, setAnimeData] = useState(mockAnimeData);
  const [users, setUsers] = useState([]);
  
  // Google OAuth Integration
  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = initializeGoogleAuth;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeGoogleAuth = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
      });

      // Auto sign-in check
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin'),
        { 
          theme: 'filled_blue',
          size: 'large',
          width: 250
        }
      );
    }
  };

  const handleGoogleSignIn = (response) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const userData = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        subscription: 'Premium'
      };

      setUser(userData);
      
      // Check if user is admin
      if (payload.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        setNotifications(prev => [...prev, { 
          message: 'Welcome Admin! You have full access to the admin panel.',
          type: 'success'
        }]);
      }

      // Add to users list if not exists
      setUsers(prev => {
        const existingUser = prev.find(u => u.email === payload.email);
        if (!existingUser) {
          return [...prev, { ...userData, joinedAt: new Date().toISOString(), lastActive: new Date().toISOString() }];
        }
        return prev.map(u => u.email === payload.email ? { ...u, lastActive: new Date().toISOString() } : u);
      });

    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setNotifications(prev => [...prev, { 
        message: 'Sign-in failed. Please try again.',
        type: 'error'
      }]);
    }
  };

  const signOut = () => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    setIsAdmin(false);
    navigate('/');
  };

  const navigate = (path) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    setSidebarOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const addToWatchlist = (anime) => {
    setWatchlist(prev => [...prev, anime]);
    setNotifications(prev => [...prev, { 
      message: `${anime.title} added to watchlist`,
      type: 'success'
    }]);
  };

  const rateAnime = (animeId, rating) => {
    setUserRatings(prev => ({ ...prev, [animeId]: rating }));
  };

  // Admin Functions
  const addAnime = (animeData) => {
    const newAnime = {
      ...animeData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: "0"
    };
    setAnimeData(prev => [...prev, newAnime]);
    setNotifications(prev => [...prev, { 
      message: `${animeData.title} has been added successfully!`,
      type: 'success'
    }]);
  };

  const updateAnime = (animeId, updatedData) => {
    setAnimeData(prev => prev.map(anime => 
      anime.id === animeId 
        ? { ...anime, ...updatedData, updatedAt: new Date().toISOString() }
        : anime
    ));
    setNotifications(prev => [...prev, { 
      message: `Anime updated successfully!`,
      type: 'success'
    }]);
  };

  const deleteAnime = (animeId) => {
    setAnimeData(prev => prev.filter(anime => anime.id !== animeId));
    setNotifications(prev => [...prev, { 
      message: `Anime deleted successfully!`,
      type: 'success'
    }]);
  };

  const themes = {
    dark: {
      bg: 'bg-gray-900',
      surface: 'bg-gray-800',
      surfaceHover: 'hover:bg-gray-700',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      border: 'border-gray-700',
      accent: 'bg-purple-600 hover:bg-purple-700',
      input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    },
    light: {
      bg: 'bg-gray-50',
      surface: 'bg-white',
      surfaceHover: 'hover:bg-gray-50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      accent: 'bg-purple-600 hover:bg-purple-700',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
    }
  };

  const currentTheme = themes[theme];

  // Navigation Component
  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-full w-64 ${currentTheme.surface} border-r ${currentTheme.border} transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-2xl font-bold ${currentTheme.text} bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent`}>
            AnimeStream+
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className={currentTheme.textSecondary} size={24} />
          </button>
        </div>
        
        <nav className="space-y-2">
          {[
            { path: '/', icon: Home, label: 'Home' },
            { path: '/trending', icon: Tv, label: 'Trending' },
            { path: '/genres', icon: Grid, label: 'Genres' },
            { path: '/watchlist', icon: Bookmark, label: 'My Watchlist' },
            { path: '/history', icon: History, label: 'History' },
            { path: '/profile', icon: User, label: 'Profile' }
          ].map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === path 
                  ? `${currentTheme.accent} text-white` 
                  : `${currentTheme.textSecondary} ${currentTheme.surfaceHover}`
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="pt-4 mt-4 border-t border-gray-700">
                <p className={`${currentTheme.textSecondary} text-xs uppercase tracking-wider mb-2`}>Admin Panel</p>
                {[
                  { path: '/admin', icon: Shield, label: 'Dashboard' },
                  { path: '/admin/anime', icon: Database, label: 'Manage Anime' },
                  { path: '/admin/users', icon: Users, label: 'User Management' },
                  { path: '/admin/analytics', icon: BarChart, label: 'Analytics' }
                ].map(({ path, icon: Icon, label }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      currentPath === path 
                        ? `bg-red-600 text-white` 
                        : `${currentTheme.textSecondary} ${currentTheme.surfaceHover}`
                    }`}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </nav>
      </div>
    </div>
  );

  // Header Component
  const Header = () => (
    <header className={`${currentTheme.surface} border-b ${currentTheme.border} sticky top-0 z-40`}>
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden ${currentTheme.textSecondary}`}
            >
              <Menu size={24} />
            </button>
            
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${currentTheme.textSecondary}`} size={20} />
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${currentTheme.input} focus:ring-2 focus:ring-purple-500 focus:outline-none`}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${currentTheme.surfaceHover} ${currentTheme.textSecondary}`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className={`relative p-2 rounded-lg ${currentTheme.surfaceHover} ${currentTheme.textSecondary}`}>
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                <div className="hidden md:block">
                  <span className={`${currentTheme.text} font-medium`}>{user.name}</span>
                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <Shield size={12} className="text-red-500" />
                      <span className="text-red-500 text-xs">Admin</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={signOut}
                  className={`text-xs ${currentTheme.textSecondary} hover:text-red-400`}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div id="google-signin"></div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // Admin Dashboard
  const AdminDashboard = () => {
    const totalAnime = animeData.length;
    const totalUsers = users.length;
    const totalViews = animeData.reduce((sum, anime) => sum + parseFloat(anime.views.replace('M', '')), 0);
    const avgRating = (animeData.reduce((sum, anime) => sum + anime.rating, 0) / totalAnime).toFixed(1);

    const recentActivity = [
      { action: 'New anime added', item: 'Attack on Titan Final Season', time: '2 hours ago', type: 'add' },
      { action: 'User registered', item: 'user@email.com', time: '3 hours ago', type: 'user' },
      { action: 'Anime updated', item: 'Demon Slayer', time: '1 day ago', type: 'edit' },
      { action: 'Episode added', item: 'Jujutsu Kaisen - Episode 15', time: '2 days ago', type: 'add' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={`${currentTheme.text} text-3xl font-bold`}>Admin Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Shield className="text-red-500" size={24} />
            <span className="text-red-500 font-bold">Administrator Panel</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`${currentTheme.surface} p-6 rounded-lg border-l-4 border-purple-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${currentTheme.textSecondary} text-sm`}>Total Anime</p>
                <p className={`${currentTheme.text} text-2xl font-bold`}>{totalAnime}</p>
              </div>
              <Database className="text-purple-500" size={32} />
            </div>
          </div>

          <div className={`${currentTheme.surface} p-6 rounded-lg border-l-4 border-blue-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${currentTheme.textSecondary} text-sm`}>Total Users</p>
                <p className={`${currentTheme.text} text-2xl font-bold`}>{totalUsers}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>

          <div className={`${currentTheme.surface} p-6 rounded-lg border-l-4 border-green-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${currentTheme.textSecondary} text-sm`}>Total Views</p>
                <p className={`${currentTheme.text} text-2xl font-bold`}>{totalViews.toFixed(1)}M</p>
              </div>
              <Eye className="text-green-500" size={32} />
            </div>
          </div>

          <div className={`${currentTheme.surface} p-6 rounded-lg border-l-4 border-yellow-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${currentTheme.textSecondary} text-sm`}>Avg Rating</p>
                <p className={`${currentTheme.text} text-2xl font-bold`}>{avgRating}</p>
              </div>
              <Star className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${currentTheme.surface} p-6 rounded-lg`}>
          <h3 className={`${currentTheme.text} text-xl font-bold mb-4`}>Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'add' ? 'bg-green-500' :
                  activity.type === 'edit' ? 'bg-yellow-500' :
                  activity.type === 'user' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className={`${currentTheme.text} text-sm`}>
                    <span className="font-medium">{activity.action}:</span> {activity.item}
                  </p>
                  <p className={`${currentTheme.textSecondary} text-xs`}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${currentTheme.surface} p-6 rounded-lg`}>
          <h3 className={`${currentTheme.text} text-xl font-bold mb-4`}>Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/anime/add')}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span>Add New Anime</span>
            </button>
            
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors"
            >
              <Users size={20} />
              <span>Manage Users</span>
            </button>
            
            <button
              onClick={() => navigate('/admin/analytics')}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors"
            >
              <BarChart size={20} />
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Admin Anime Management
  const AdminAnimeManagement = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAnime, setEditingAnime] = useState(null);
    const [animeForm, setAnimeForm] = useState({
      title: '',
      poster: '',
      rating: '',
      year: new Date().getFullYear(),
      status: 'Ongoing',
      genre: [],
      episodes: 0,
      description: '',
      studio: '',
      trailer: ''
    });

    const genres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];

    const resetForm = () => {
      setAnimeForm({
        title: '',
        poster: '',
        rating: '',
        year: new Date().getFullYear(),
        status: 'Ongoing',
        genre: [],
        episodes: 0,
        description: '',
        studio: '',
        trailer: ''
      });
      setEditingAnime(null);
      setShowAddForm(false);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (editingAnime) {
        updateAnime(editingAnime.id, animeForm);
      } else {
        addAnime(animeForm);
      }
      resetForm();
    };

    const handleEdit = (anime) => {
      setAnimeForm(anime);
      setEditingAnime(anime);
      setShowAddForm(true);
    };

    const handleDelete = (animeId) => {
      if (window.confirm('Are you sure you want to delete this anime?')) {
        deleteAnime(animeId);
      }
    };

    const toggleGenre = (genre) => {
      setAnimeForm(prev => ({
        ...prev,
        genre: prev.genre.includes(genre)
          ? prev.genre.filter(g => g !== genre)
          : [...prev.genre, genre]
      }));
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={`${currentTheme.text} text-3xl font-bold`}>Manage Anime</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Add New Anime</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className={`${currentTheme.surface} p-6 rounded-lg`}>
            <h3 className={`${currentTheme.text} text-xl font-bold mb-4`}>
              {editingAnime ? 'Edit Anime' : 'Add New Anime'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Title *</label>
                  <input
                    type="text"
                    required
                    value={animeForm.title}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Studio *</label>
                  <input
                    type="text"
                    required
                    value={animeForm.studio}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, studio: e.target.value }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Poster URL *</label>
                  <input
                    type="url"
                    required
                    value={animeForm.poster}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, poster: e.target.value }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Rating (1-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={animeForm.rating}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Year</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    value={animeForm.year}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Status</label>
                  <select
                    value={animeForm.status}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, status: e.target.value }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>

                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Episodes</label>
                  <input
                    type="number"
                    min="0"
                    value={animeForm.episodes}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, episodes: parseInt(e.target.value) }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Trailer URL</label>
                  <input
                    type="url"
                    value={animeForm.trailer}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, trailer: e.target.value }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>
              </div>

              <div>
                <label className={`${currentTheme.text} block mb-2`}>Description *</label>
                <textarea
                  required
                  rows={4}
                  value={animeForm.description}
                  onChange={(e) => setAnimeForm(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                />
              </div>

              <div>
                <label className={`${currentTheme.text} block mb-2`}>Genres</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        animeForm.genre.includes(genre)
                          ? 'bg-purple-600 text-white'
                          : `${currentTheme.surface} ${currentTheme.text} ${currentTheme.surfaceHover}`
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <Save size={20} />
                  <span>{editingAnime ? 'Update Anime' : 'Add Anime'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`${currentTheme.surface} border ${currentTheme.border} ${currentTheme.text} px-6 py-2 rounded-lg ${currentTheme.surfaceHover} transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Anime List */}
        <div className={`${currentTheme.surface} rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`bg-gray-700`}>
                <tr>
                  <th className="text-left p-4 text-white">Anime</th>
                  <th className="text-left p-4 text-white">Studio</th>
                  <th className="text-left p-4 text-white">Year</th>
                  <th className="text-left p-4 text-white">Status</th>
                  <th className="text-left p-4 text-white">Episodes</th>
                  <th className="text-left p-4 text-white">Rating</th>
                  <th className="text-left p-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {animeData.map(anime => (
                  <tr key={anime.id} className={`border-t ${currentTheme.border}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img src={anime.poster} alt={anime.title} className="w-12 h-16 object-cover rounded" />
                        <div>
                          <h4 className={`${currentTheme.text} font-medium`}>{anime.title}</h4>
                          <p className={`${currentTheme.textSecondary} text-sm`}>{anime.views} views</p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 ${currentTheme.text}`}>{anime.studio}</td>
                    <td className={`p-4 ${currentTheme.text}`}>{anime.year}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        anime.status === 'Ongoing' ? 'bg-green-500 text-white' :
                        anime.status === 'Completed' ? 'bg-blue-500 text-white' :
                        'bg-yellow-500 text-black'
                      }`}>
                        {anime.status}
                      </span>
                    </td>
                    <td className={`p-4 ${currentTheme.text}`}>{anime.episodes}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-400" size={16} fill="currentColor" />
                        <span className={currentTheme.text}>{anime.rating}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(anime)}
                          className="p-2 text-blue-500 hover:bg-blue-500/20 rounded transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/anime/${anime.id}/episodes`)}
                          className="p-2 text-green-500 hover:bg-green-500/20 rounded transition-colors"
                          title="Manage Episodes"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(anime.id)}
                          className="p-2 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Episode Management Component
  const EpisodeManagement = () => {
    const animeId = parseInt(currentPath.split('/')[3]);
    const anime = animeData.find(a => a.id === animeId);
    const [episodes, setEpisodes] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [episodeForm, setEpisodeForm] = useState({
      number: 1,
      title: '',
      description: '',
      duration: 24,
      videoUrl: '',
      thumbnailUrl: '',
      releaseDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
      // Load episodes for this anime (mock data)
      if (anime) {
        const mockEpisodes = Array.from({length: anime.episodes}, (_, i) => ({
          id: i + 1,
          number: i + 1,
          title: `Episode ${i + 1}`,
          description: `Episode ${i + 1} description`,
          duration: 24,
          videoUrl: '',
          thumbnailUrl: anime.poster,
          releaseDate: new Date(Date.now() - (anime.episodes - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          views: Math.floor(Math.random() * 1000000)
        }));
        setEpisodes(mockEpisodes);
      }
    }, [anime]);

    const handleAddEpisode = (e) => {
      e.preventDefault();
      const newEpisode = {
        ...episodeForm,
        id: episodes.length + 1,
        views: 0
      };
      setEpisodes(prev => [...prev, newEpisode]);
      setEpisodeForm({
        number: episodes.length + 2,
        title: '',
        description: '',
        duration: 24,
        videoUrl: '',
        thumbnailUrl: '',
        releaseDate: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      setNotifications(prev => [...prev, { 
        message: `Episode ${newEpisode.number} added successfully!`,
        type: 'success'
      }]);
    };

    const handleDeleteEpisode = (episodeId) => {
      if (window.confirm('Are you sure you want to delete this episode?')) {
        setEpisodes(prev => prev.filter(ep => ep.id !== episodeId));
        setNotifications(prev => [...prev, { 
          message: 'Episode deleted successfully!',
          type: 'success'
        }]);
      }
    };

    if (!anime) {
      return (
        <div className={`${currentTheme.text} text-center py-8`}>
          Anime not found
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/admin/anime')}
              className={`${currentTheme.textSecondary} hover:text-purple-400 text-sm mb-2`}
            >
              ← Back to Anime Management
            </button>
            <h1 className={`${currentTheme.text} text-3xl font-bold`}>
              Manage Episodes - {anime.title}
            </h1>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Add Episode</span>
          </button>
        </div>

        {/* Add Episode Form */}
        {showAddForm && (
          <div className={`${currentTheme.surface} p-6 rounded-lg`}>
            <h3 className={`${currentTheme.text} text-xl font-bold mb-4`}>Add New Episode</h3>
            <form onSubmit={handleAddEpisode} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Episode Number</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={episodeForm.number}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, number: parseInt(e.target.value) }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={episodeForm.duration}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`${currentTheme.text} block mb-2`}>Episode Title</label>
                  <input
                    type="text"
                    required
                    value={episodeForm.title}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Video URL</label>
                  <input
                    type="url"
                    value={episodeForm.videoUrl}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Thumbnail URL</label>
                  <input
                    type="url"
                    value={episodeForm.thumbnailUrl}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`${currentTheme.text} block mb-2`}>Release Date</label>
                  <input
                    type="date"
                    value={episodeForm.releaseDate}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, releaseDate: e.target.value }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`${currentTheme.text} block mb-2`}>Description</label>
                  <textarea
                    rows={3}
                    value={episodeForm.description}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full ${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <Save size={20} />
                  <span>Add Episode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`${currentTheme.surface} border ${currentTheme.border} ${currentTheme.text} px-6 py-2 rounded-lg ${currentTheme.surfaceHover} transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Episodes List */}
        <div className={`${currentTheme.surface} rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`bg-gray-700`}>
                <tr>
                  <th className="text-left p-4 text-white">Episode</th>
                  <th className="text-left p-4 text-white">Title</th>
                  <th className="text-left p-4 text-white">Duration</th>
                  <th className="text-left p-4 text-white">Release Date</th>
                  <th className="text-left p-4 text-white">Views</th>
                  <th className="text-left p-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {episodes.map(episode => (
                  <tr key={episode.id} className={`border-t ${currentTheme.border}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img src={episode.thumbnailUrl || anime.poster} alt={episode.title} className="w-16 h-12 object-cover rounded" />
                        <span className={`${currentTheme.text} font-bold`}>#{episode.number}</span>
                      </div>
                    </td>
                    <td className={`p-4 ${currentTheme.text}`}>
                      <div>
                        <h4 className="font-medium">{episode.title}</h4>
                        <p className={`${currentTheme.textSecondary} text-sm line-clamp-2`}>{episode.description}</p>
                      </div>
                    </td>
                    <td className={`p-4 ${currentTheme.text}`}>{episode.duration} min</td>
                    <td className={`p-4 ${currentTheme.text}`}>{episode.releaseDate}</td>
                    <td className={`p-4 ${currentTheme.text}`}>{episode.views.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/watch/${animeId}/${episode.number}`)}
                          className="p-2 text-green-500 hover:bg-green-500/20 rounded transition-colors"
                          title="Watch Episode"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          className="p-2 text-blue-500 hover:bg-blue-500/20 rounded transition-colors"
                          title="Edit Episode"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEpisode(episode.id)}
                          className="p-2 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                          title="Delete Episode"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // User Management Component
  const UserManagement = () => {
    const [userFilter, setUserFilter] = useState('all');
    const [searchUser, setSearchUser] = useState('');

    const filteredUsers = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchUser.toLowerCase());
      const matchesFilter = userFilter === 'all' || user.subscription.toLowerCase() === userFilter;
      return matchesSearch && matchesFilter;
    });

    const handleUserAction = (userId, action) => {
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'suspend':
              return { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' };
            case 'premium':
              return { ...user, subscription: user.subscription === 'Premium' ? 'Free' : 'Premium' };
            default:
              return user;
          }
        }
        return user;
      }));
      
      setNotifications(prev => [...prev, { 
        message: `User ${action} action completed successfully!`,
        type: 'success'
      }]);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={`${currentTheme.text} text-3xl font-bold`}>User Management</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${currentTheme.textSecondary}`} size={16} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className={`pl-10 pr-4 py-2 ${currentTheme.input} rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none`}
              />
            </div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className={`${currentTheme.input} rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
            >
              <option value="all">All Users</option>
              <option value="premium">Premium</option>
              <option value="free">Free</option>
            </select>
          </div>
        </div>

        <div className={`${currentTheme.surface} rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`bg-gray-700`}>
                <tr>
                  <th className="text-left p-4 text-white">User</th>
                  <th className="text-left p-4 text-white">Email</th>
                  <th className="text-left p-4 text-white">Subscription</th>
                  <th className="text-left p-4 text-white">Joined</th>
                  <th className="text-left p-4 text-white">Last Active</th>
                  <th className="text-left p-4 text-white">Status</th>
                  <th className="text-left p-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className={`border-t ${currentTheme.border}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <h4 className={`${currentTheme.text} font-medium`}>{user.name}</h4>
                          <p className={`${currentTheme.textSecondary} text-sm`}>ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 ${currentTheme.text}`}>{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.subscription === 'Premium' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {user.subscription}
                      </span>
                    </td>
                    <td className={`p-4 ${currentTheme.text} text-sm`}>
                      {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className={`p-4 ${currentTheme.text} text-sm`}>
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        user.status === 'suspended' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className={`p-2 rounded transition-colors ${
                            user.status === 'suspended'
                              ? 'text-green-500 hover:bg-green-500/20'
                              : 'text-red-500 hover:bg-red-500/20'
                          }`}
                          title={user.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                        >
                          <UserCheck size={16} />
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, 'premium')}
                          className="p-2 text-purple-500 hover:bg-purple-500/20 rounded transition-colors"
                          title="Toggle Premium"
                        >
                          <Star size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Analytics Component
  const Analytics = () => {
    const totalViews = animeData.reduce((sum, anime) => sum + parseFloat(anime.views.replace('M', '')), 0);
    const avgRating = (animeData.reduce((sum, anime) => sum + anime.rating, 0) / animeData.length).toFixed(1);
    const totalEpisodes = animeData.reduce((sum, anime) => sum + anime.episodes, 0);

    const genreStats = animeData.reduce((acc, anime) => {
      anime.genre.forEach(genre => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    }, {});

    const popularGenres = Object.entries(genreStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return (
      <div className="space-y-6">
        <h1 className={`${currentTheme.text} text-3xl font-bold`}>Analytics Dashboard</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`${currentTheme.surface} p-6 rounded-lg border-l-4 border-blue-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${currentTheme.textSecondary} text-sm`}>Total Views</p>
                <p className={`${currentTheme.text} text-2xl font-bold`}>{totalViews.toFixed(1)}M</p>
              </div>
              <Eye className="text-blue-500" size={32} />
            </div>
          </div>

          <div className={`${currentTheme.surface} p-6 rounded-lg border-l-4 border-green-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${currentTheme.textSecondary} text-sm`}>Active Users</p>
                <p className={`${currentTheme.text} text-2xl font-bold`}>{users.length}</p>
              </div>
              <Users className="text-green-500" size={32} />
            </div>
          </div>

          <div className={`${currentTheme.surface} p-6 rounded-lg border-l-4 border-yellow-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${currentTheme.textSecondary} text-sm`}>Average Rating</p>
                <p className={`${currentTheme.text} text-2xl font-bold`}>{avgRating}</p>
              </div>
              <Star className="text-yellow-500" size={32} />
            </div>
          </div>

          <div className={`${currentTheme.surface} p-6 rounded-lg border-l-4 border-purple-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${currentTheme.textSecondary} text-sm`}>Total Episodes</p>
                <p className={`${currentTheme.text} text-2xl font-bold`}>{totalEpisodes}</p>
              </div>
              <Play className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Genres */}
          <div className={`${currentTheme.surface} p-6 rounded-lg`}>
            <h3 className={`${currentTheme.text} text-xl font-bold mb-4`}>Popular Genres</h3>
            <div className="space-y-3">
              {popularGenres.map(([genre, count], index) => (
                <div key={genre} className="flex items-center justify-between">
                  <span className={currentTheme.text}>{genre}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-600 rounded-full">
                      <div 
                        className="h-2 bg-purple-500 rounded-full" 
                        style={{ width: `${(count / Math.max(...popularGenres.map(([,c]) => c))) * 100}%` }}
                      />
                    </div>
                    <span className={`${currentTheme