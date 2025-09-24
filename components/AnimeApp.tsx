import React, { useState, useEffect } from 'react';
import { Search, Play, Star, Bell, User, Moon, Sun, Menu, X, Home, Tv, Grid, Bookmark, History, Shield, Database, Users, BarChart, Plus, Edit, Trash2, Eye } from 'lucide-react';

const GOOGLE_CLIENT_ID = "779631712094-6t77ptt5366r218o80pmijmeelboj25g.apps.googleusercontent.com";
const ADMIN_EMAIL = "hanzgantengno1@gmail.com";

const initialAnime = [
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
    views: "12.5M"
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
    views: "8.3M"
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
    views: "15.2M"
  }
];

export default function AnimeApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [animeData, setAnimeData] = useState(initialAnime);
  const [notifications, setNotifications] = useState([]);

  // Google OAuth Integration
  useEffect(() => {
    const initGoogleAuth = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
        });

        const googleButton = document.getElementById('google-signin');
        if (googleButton) {
          window.google.accounts.id.renderButton(googleButton, {
            theme: 'filled_blue',
            size: 'large',
            width: 250
          });
        }
      }
    };

    if (window.google) {
      initGoogleAuth();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initGoogleAuth();
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }
  }, []);

  const handleGoogleSignIn = (response: any) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const userData = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
      };

      setUser(userData);

      if (payload.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        addNotification('Welcome Admin! Full access granted.', 'success');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      addNotification('Sign-in failed. Please try again.', 'error');
    }
  };

  const signOut = () => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    setIsAdmin(false);
    setCurrentPage('home');
  };

  const addNotification = (message: string, type: string) => {
    const notification = { message, type, id: Date.now() };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Sidebar Component
  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            AnimeStream+
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="text-gray-300" size={24} />
          </button>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'trending', icon: Tv, label: 'Trending' },
            { id: 'genres', icon: Grid, label: 'Genres' },
            { id: 'watchlist', icon: Bookmark, label: 'My Watchlist' },
            { id: 'history', icon: History, label: 'History' },
            { id: 'profile', icon: User, label: 'Profile' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 mt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Admin Panel</p>
                {[
                  { id: 'admin-dashboard', icon: Shield, label: 'Dashboard' },
                  { id: 'admin-anime', icon: Database, label: 'Manage Anime' },
                  { id: 'admin-users', icon: Users, label: 'User Management' },
                  { id: 'admin-analytics', icon: BarChart, label: 'Analytics' }
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setCurrentPage(id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      currentPage === id 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-400 hover:bg-gray-700'
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
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-300"
            >
              <Menu size={24} />
            </button>
            
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search anime..."
                className="pl-10 pr-4 py-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className="relative p-2 rounded-lg hover:bg-gray-700 text-gray-400">
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                <div className="hidden md:block">
                  <span className="text-white font-medium">{user.name}</span>
                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <Shield size={12} className="text-red-500" />
                      <span className="text-red-500 text-xs">Admin</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={signOut}
                  className="text-xs text-gray-400 hover:text-red-400"
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

  // Home Page
  const HomePage = () => (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-white text-4xl font-bold mb-4">Welcome to AnimeStream+</h1>
        <p className="text-gray-400 text-lg">Your premium anime streaming platform</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {animeData.map(anime => (
          <div key={anime.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <img src={anime.poster} alt={anime.title} className="w-full h-64 object-cover" />
            <div className="p-4">
              <h3 className="text-white font-bold text-lg mb-2">{anime.title}</h3>
              <p className="text-gray-400 text-sm mb-2 line-clamp-3">{anime.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-400" size={16} fill="currentColor" />
                  <span className="text-white">{anime.rating}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded ${
                  anime.status === 'Ongoing' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {anime.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Admin Dashboard
  const AdminDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Shield className="text-red-500" size={24} />
          <span className="text-red-500 font-bold">Administrator Panel</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Anime</p>
              <p className="text-white text-2xl font-bold">{animeData.length}</p>
            </div>
            <Database className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-white text-2xl font-bold">156</p>
            </div>
            <Users className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Views</p>
              <p className="text-white text-2xl font-bold">35.8M</p>
            </div>
            <Eye className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Rating</p>
              <p className="text-white text-2xl font-bold">8.9</p>
            </div>
            <Star className="text-yellow-500" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setCurrentPage('admin-anime')}
          className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Manage Anime</span>
        </button>
        
        <button
          onClick={() => setCurrentPage('admin-users')}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors"
        >
          <Users size={20} />
          <span>Manage Users</span>
        </button>
        
        <button
          onClick={() => setCurrentPage('admin-analytics')}
          className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors"
        >
          <BarChart size={20} />
          <span>View Analytics</span>
        </button>
      </div>
    </div>
  );

  // Admin Anime Management
  const AdminAnimeManagement = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [animeForm, setAnimeForm] = useState({
      title: '',
      poster: '',
      rating: 0,
      year: new Date().getFullYear(),
      status: 'Ongoing',
      genre: [],
      episodes: 0,
      description: '',
      studio: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newAnime = {
        ...animeForm,
        id: Date.now(),
        views: "0"
      };
      setAnimeData(prev => [...prev, newAnime]);
      setAnimeForm({
        title: '',
        poster: '',
        rating: 0,
        year: new Date().getFullYear(),
        status: 'Ongoing',
        genre: [],
        episodes: 0,
        description: '',
        studio: ''
      });
      setShowAddForm(false);
      addNotification('Anime added successfully!', 'success');
    };

    const deleteAnime = (id: number) => {
      if (window.confirm('Are you sure you want to delete this anime?')) {
        setAnimeData(prev => prev.filter(anime => anime.id !== id));
        addNotification('Anime deleted successfully!', 'success');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-3xl font-bold">Manage Anime</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Add New Anime</span>
          </button>
        </div>

        {showAddForm && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-white text-xl font-bold mb-4">Add New Anime</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white block mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={animeForm.title}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-white block mb-2">Studio *</label>
                  <input
                    type="text"
                    required
                    value={animeForm.studio}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, studio: e.target.value }))}
                    className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-white block mb-2">Poster URL *</label>
                  <input
                    type="url"
                    required
                    value={animeForm.poster}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, poster: e.target.value }))}
                    className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-white block mb-2">Rating (1-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={animeForm.rating}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                    className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-white block mb-2">Episodes</label>
                  <input
                    type="number"
                    min="0"
                    value={animeForm.episodes}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, episodes: parseInt(e.target.value) }))}
                    className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-white block mb-2">Status</label>
                  <select
                    value={animeForm.status}
                    onChange={(e) => setAnimeForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white block mb-2">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={animeForm.description}
                  onChange={(e) => setAnimeForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                  <span>Add Anime</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
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
                  <tr key={anime.id} className="border-t border-gray-700">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img src={anime.poster} alt={anime.title} className="w-12 h-16 object-cover rounded" />
                        <div>
                          <h4 className="text-white font-medium">{anime.title}</h4>
                          <p className="text-gray-400 text-sm">{anime.views} views</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white">{anime.studio}</td>
                    <td className="p-4 text-white">{anime.year}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        anime.status === 'Ongoing' ? 'bg-green-500 text-white' :
                        anime.status === 'Completed' ? 'bg-blue-500 text-white' :
                        'bg-yellow-500 text-black'
                      }`}>
                        {anime.status}
                      </span>
                    </td>
                    <td className="p-4 text-white">{anime.episodes}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-400" size={16} fill="currentColor" />
                        <span className="text-white">{anime.rating}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-500 hover:bg-blue-500/20 rounded transition-colors">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteAnime(anime.id)}
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

  // Route renderer
  const renderPage = () => {
    if (isAdmin && currentPage.startsWith('admin')) {
      if (currentPage === 'admin-dashboard') return <AdminDashboard />;
      if (currentPage === 'admin-anime') return <AdminAnimeManagement />;
      return <div className="text-center py-8 text-white">Admin feature in development...</div>;
    }
    
    if (currentPage === 'home') return <HomePage />;
    return <div className="text-center py-8 text-white">Page in development...</div>;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="p-6">
          {user ? renderPage() : (
            <div className="bg-gray-800 rounded-lg p-12 text-center">
              <h2 className="text-white text-3xl font-bold mb-4">Welcome to AnimeStream+</h2>
              <p className="text-gray-400 mb-6">Please sign in with Google to continue</p>
              <div id="google-signin"></div>
            </div>
          )}
        </main>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification: any, index) => (
            <div key={index} className={`${notification.type === 'error' ? 'bg-red-600' : 'bg-purple-600'} text-white px-4 py-3 rounded-lg shadow-lg max-w-sm`}>
              <div className="flex items-center justify-between">
                <span className="text-sm">{notification.message}</span>
                <button onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}>
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window {
    google: any;
  }
}