"use client";


/* anime-streaming-app.tsx
   Merged user + admin React app (single-file). 
   Note: This is a large single-file demo combining features from both uploaded files.
   You can split into components/files later as needed.
*/
import React, { useState, useEffect, createContext } from 'react';
import {
  Search, Play, Star, Heart, Bell, User, Settings, History, BookOpen, Filter,
  Moon, Sun, Menu, X, ChevronDown, ChevronRight, Eye, Clock, Calendar, Users,
  MessageCircle, Share2, Download, Bookmark, ThumbsUp, Home, Tv, Grid, List,
  Plus, Edit, Trash2, Upload, Save, UserCheck, Shield, Database, BarChart
} from 'lucide-react';

/* -------------------------
   CONFIG
------------------------- */
const GOOGLE_CLIENT_ID = "779631712094-6t77ptt5366r218o80pmijmeelboj25g.apps.googleusercontent.com";
const ADMIN_EMAIL = "hanzgantengno1@gmail.com";

/* -------------------------
   MOCK DATA (merged + trimmed)
------------------------- */
const mockAnimeDataDefault = [
  { id: 1, title: "Attack on Titan Final Season", poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop", rating: 9.2, year: 2024, status: "Ongoing", genre: ["Action","Drama","Fantasy"], episodes: 24, description: "The final battle...", studio: "MAPPA", views: "12.5M" },
  { id: 2, title: "Demon Slayer: Infinity Castle", poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop", rating: 8.9, year: 2024, status: "Completed", genre: ["Action","Supernatural","Historical"], episodes: 12, description: "Tanjiro faces his greatest challenge.", studio: "Ufotable", views: "8.3M" },
  { id: 3, title: "Jujutsu Kaisen Season 3", poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop", rating: 8.7, year: 2024, status: "Ongoing", genre: ["Action","School","Supernatural"], episodes: 24, description: "The Culling Game arc...", studio: "MAPPA", views: "15.2M" }
];

/* -------------------------
   Contexts
------------------------- */
export const ThemeContext = createContext('dark');

/* -------------------------
   Simple Router
------------------------- */
const Router = ({ children, currentPath, navigate }) => {
  return React.Children.map(children, child =>
    React.cloneElement(child, { currentPath, navigate })
  );
};

/* -------------------------
   Main App
------------------------- */
const AnimeStreamingApp = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [animeData, setAnimeData] = useState(mockAnimeDataDefault);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handlePop = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  useEffect(() => {
    // load google script lazily (non-functional in offline/demo)
    const id = 'google-sdk';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id;
      s.src = 'https://accounts.google.com/gsi/client';
      s.onload = () => {
        /* initialize would go here */
      };
      document.body.appendChild(s);
    }
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setSidebarOpen(false);
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const signInMock = (email = 'animefan@gmail.com') => {
    // Mock sign-in: sets user and admin flag if email matches ADMIN_EMAIL
    const payload = { sub: 'u1', name: 'Anime Fan', email, picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' };
    const userData = { id: payload.sub, name: payload.name, email: payload.email, avatar: payload.picture, subscription: 'Premium' };
    setUser(userData);
    setIsAdmin(payload.email === ADMIN_EMAIL);
    setNotifications(n => [...n, { message: `Signed in as ${payload.name}`, type: 'success' }]);
  };

  const signOut = () => {
    setUser(null);
    setIsAdmin(false);
    navigate('/');
  };

  const addToWatchlist = (anime) => {
    setWatchlist(prev => {
      if (prev.find(a => a.id === anime.id)) return prev;
      return [...prev, anime];
    });
    setNotifications(n => [...n, { message: `${anime.title} added to watchlist`, type: 'success' }]);
  };

  const rateAnime = (animeId, rating) => setUserRatings(prev => ({ ...prev, [animeId]: rating }));

  const addAnime = (form) => {
    const newAnime = { ...form, id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), views: "0" };
    setAnimeData(prev => [...prev, newAnime]);
    setNotifications(n => [...n, { message: `${form.title} added`, type: 'success' }]);
  };

  const updateAnime = (id, data) => {
    setAnimeData(prev => prev.map(a => a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a));
    setNotifications(n => [...n, { message: `Anime updated`, type: 'success' }]);
  };

  const deleteAnime = (id) => {
    setAnimeData(prev => prev.filter(a => a.id !== id));
    setNotifications(n => [...n, { message: `Anime deleted`, type: 'success' }]);
  };

  const themes = {
    dark: { bg: 'bg-gray-900', surface: 'bg-gray-800', text: 'text-white', input: 'bg-gray-700 text-white', accent: 'bg-purple-600' },
    light: { bg: 'bg-gray-50', surface: 'bg-white', text: 'text-gray-900', input: 'bg-white text-gray-900', accent: 'bg-purple-600' }
  };
  const currentTheme = themes[theme];

  /* -------------------------
     UI COMPONENTS (simplified)
  ------------------------- */
  const Header = () => (
    <header className={`${currentTheme.surface} p-4 border-b`}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button onClick={() => setSidebarOpen(s => !s)}><Menu /></button>
          <div style={{position:'relative'}}>
            <Search style={{position:'absolute', left:8, top:8}} />
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search anime..." style={{padding:'8px 12px 8px 32px', borderRadius:8}}/>
          </div>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button onClick={toggleTheme}>{theme === 'dark' ? <Sun /> : <Moon />}</button>
          <button><Bell /></button>
          {user ? (
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <img src={user.avatar} alt={user.name} style={{width:32,height:32,borderRadius:999}}/>
              <div>
                <div style={{fontWeight:600}}>{user.name}</div>
                {isAdmin && <div style={{color:'red',fontSize:12}}>Admin</div>}
              </div>
              <button onClick={signOut} style={{marginLeft:8}}>Sign Out</button>
            </div>
          ) : (
            <div>
              <button onClick={()=>signInMock()}>Sign in (mock)</button>
              <button onClick={()=>signInMock(ADMIN_EMAIL)} style={{marginLeft:8}}>Sign in as Admin (mock)</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  const Sidebar = () => (
    <aside style={{width:240, padding:16, borderRight:'1px solid #333', position:'fixed', left: sidebarOpen ? 0 : -300, top:0, bottom:0, transition:'left 0.2s', background: theme==='dark' ? '#111' : '#fff' }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
        <h2 style={{fontWeight:800}}>AnimeStream+</h2>
        <button onClick={()=>setSidebarOpen(false)}><X /></button>
      </div>

      <nav style={{display:'flex', flexDirection:'column', gap:8}}>
        <button onClick={()=>navigate('/')} style={{textAlign:'left'}}>Home</button>
        <button onClick={()=>navigate('/trending')} style={{textAlign:'left'}}>Trending</button>
        <button onClick={()=>navigate('/genres')} style={{textAlign:'left'}}>Genres</button>
        <button onClick={()=>navigate('/watchlist')} style={{textAlign:'left'}}>My Watchlist</button>
        <button onClick={()=>navigate('/history')} style={{textAlign:'left'}}>History</button>
        <button onClick={()=>navigate('/profile')} style={{textAlign:'left'}}>Profile</button>

        {isAdmin && (
          <>
            <hr />
            <div style={{fontSize:12, color:'#888'}}>Admin Panel</div>
            <button onClick={()=>navigate('/admin')} style={{textAlign:'left'}}>Dashboard</button>
            <button onClick={()=>navigate('/admin/anime')} style={{textAlign:'left'}}>Manage Anime</button>
            <button onClick={()=>navigate('/admin/users')} style={{textAlign:'left'}}>User Management</button>
            <button onClick={()=>navigate('/admin/analytics')} style={{textAlign:'left'}}>Analytics</button>
          </>
        )}
      </nav>
    </aside>
  );

  /* Home Page */
  const HomePage = () => {
    const q = searchQuery.toLowerCase();
    const filtered = animeData.filter(a => {
      if (selectedGenre !== 'All' && !a.genre.includes(selectedGenre)) return false;
      if (!q) return true;
      return a.title.toLowerCase().includes(q) || a.genre.some(g => g.toLowerCase().includes(q));
    });

    return (
      <main style={{padding:24, marginLeft:260}}>
        <h1 style={{fontSize:28, marginBottom:8}}>Browse Anime</h1>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16}}>
          <select value={selectedGenre} onChange={e=>setSelectedGenre(e.target.value)}>
            <option>All</option>
            <option>Action</option>
            <option>Drama</option>
            <option>Fantasy</option>
            <option>Supernatural</option>
          </select>

          <button onClick={()=>setViewMode('grid')}>Grid</button>
          <button onClick={()=>setViewMode('list')}>List</button>
        </div>

        <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap:16}}>
          {filtered.map(a => (
            <div key={a.id} style={{background: theme==='dark' ? '#222' : '#f7f7f7', borderRadius:12, overflow:'hidden', cursor:'pointer'}} onClick={()=>navigate(`/anime/${a.id}`)}>
              <img src={a.poster} alt={a.title} style={{width:'100%', height:260, objectFit:'cover'}}/>
              <div style={{padding:12}}>
                <div style={{fontWeight:700}}>{a.title}</div>
                <div style={{display:'flex', gap:8, alignItems:'center', marginTop:8}}>
                  <Star /> <span>{a.rating}</span>
                  <span>•</span>
                  <span>{a.year}</span>
                </div>
                <div style={{marginTop:8}}>
                  <button onClick={(e)=>{ e.stopPropagation(); addToWatchlist(a); }}>Add to watchlist</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  };

  /* Anime Detail */
  const AnimeDetail = ({ id }) => {
    const anime = animeData.find(a => a.id === Number(id));
    if (!anime) return <div style={{padding:24, marginLeft:260}}>Not found</div>;
    return (
      <main style={{padding:24, marginLeft:260}}>
        <div style={{display:'flex', gap:24}}>
          <img src={anime.poster} alt="" style={{width:240, height:360, objectFit:'cover', borderRadius:8}}/>
          <div>
            <h2 style={{fontSize:24}}>{anime.title}</h2>
            <div style={{display:'flex', gap:8, alignItems:'center'}}><Star />{anime.rating}<span>•{anime.year}</span></div>
            <p style={{marginTop:12}}>{anime.description}</p>
            <div style={{marginTop:12}}>
              <button onClick={()=>navigate(`/watch/${anime.id}/1`)}><Play /> Watch</button>
              <button onClick={()=>addToWatchlist(anime)}>Add to list</button>
            </div>
          </div>
        </div>
      </main>
    );
  };

  /* Watch Page */
  const WatchPage = ({ animeId, episode }) => {
    const anime = animeData.find(a => a.id === Number(animeId));
    if (!anime) return <div style={{padding:24, marginLeft:260}}>Anime not found</div>;
    return (
      <main style={{padding:24, marginLeft:260}}>
        <h2>{anime.title} — Episode {episode}</h2>
        <div style={{background:'#000', height:420, borderRadius:8, marginTop:12, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <Play style={{color:'#fff', width:64, height:64}} />
        </div>
      </main>
    );
  };

  /* Admin - Dashboard & Manage */
  const AdminDashboard = () => {
    const totalAnime = animeData.length;
    const avgRating = (animeData.reduce((s,a)=>s+(a.rating||0),0)/Math.max(1,totalAnime)).toFixed(1);
    return (
      <main style={{padding:24, marginLeft:260}}>
        <h1>Admin Dashboard</h1>
        <div style={{display:'flex', gap:16, marginTop:12}}>
          <div style={{padding:16, borderRadius:8, background: theme==='dark' ? '#222' : '#fff'}}>Total Anime<br/><strong>{totalAnime}</strong></div>
          <div style={{padding:16, borderRadius:8, background: theme==='dark' ? '#222' : '#fff'}}>Avg Rating<br/><strong>{avgRating}</strong></div>
        </div>
      </main>
    );
  };

  const AdminManageAnime = () => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title:'', poster:'', rating:6, year:2024, status:'Ongoing', genre:[], episodes:12, description:'', studio:'' });
    const submit = (e) => { e.preventDefault(); addAnime(form); setShowForm(false); };
    return (
      <main style={{padding:24, marginLeft:260}}>
        <h1>Manage Anime</h1>
        <button onClick={()=>setShowForm(s=>!s)}>Add New</button>
        {showForm && (
          <form onSubmit={submit} style={{marginTop:12, display:'grid', gap:8, maxWidth:600}}>
            <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <input placeholder="Poster URL" value={form.poster} onChange={e=>setForm({...form,poster:e.target.value})}/>
            <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
            <div>
              <button type="submit">Save</button>
            </div>
          </form>
        )}

        <div style={{marginTop:16}}>
          {animeData.map(a => (
            <div key={a.id} style={{display:'flex', gap:12, alignItems:'center', padding:12, background: theme==='dark' ? '#111' : '#fafafa', borderRadius:8, marginBottom:8}}>
              <img src={a.poster} style={{width:64,height:88,objectFit:'cover'}}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:700}}>{a.title}</div>
                <div>{a.views} views • {a.year}</div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button onClick={()=>{ setForm(a); setShowForm(true); }}>Edit</button>
                <button onClick={()=>deleteAnime(a.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  };

  /* Simple route parsing */
  const RouteRenderer = () => {
    const path = currentPath;
    if (path === '/' || path === '/trending' || path === '/genres') return <HomePage />;
    if (path.startsWith('/anime/')) {
      const id = path.split('/')[2];
      return <AnimeDetail id={id} />;
    }
    if (path.startsWith('/watch/')) {
      const parts = path.split('/');
      return <WatchPage animeId={parts[2]} episode={parts[3] || 1} />;
    }
    if (path === '/watchlist') return <main style={{padding:24, marginLeft:260}}><h1>My Watchlist</h1>{watchlist.map(w=> <div key={w.id}>{w.title}</div>)}</main>;
    if (path === '/profile') return <main style={{padding:24, marginLeft:260}}><h1>Profile</h1><pre>{JSON.stringify(user,null,2)}</pre></main>;
    if (path === '/admin' && isAdmin) return <AdminDashboard />;
    if (path === '/admin/anime' && isAdmin) return <AdminManageAnime />;
    if (path === '/admin/users' && isAdmin) return <main style={{padding:24, marginLeft:260}}><h1>User Management</h1></main>;
    if (path === '/admin/analytics' && isAdmin) return <main style={{padding:24, marginLeft:260}}><h1>Analytics</h1></main>;
    // Default
    return <HomePage />;
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{minHeight:'100vh', background: theme==='dark' ? '#0b0b0b' : '#f5f5f5', color: theme==='dark' ? '#fff' : '#111'}}>
        <Header />
        <Sidebar />
        <RouteRenderer />
      </div>
    </ThemeContext.Provider>
  );
};

export default AnimeStreamingApp;

/* End of file */
