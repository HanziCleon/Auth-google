"use client";

import React, { useState, useEffect } from "react";
import {
  Search, Bell, User, Menu, Sun, Moon, Home, Tv, Grid, Bookmark, History,
} from "lucide-react";

const mockAnimeData = [
  {
    id: 1,
    title: "Attack on Titan Final Season",
    poster:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-_3qTfhpgKD4OD9mIL5SPjIdRTkc0dBs0K3DvGSjdm1-D8Yr6PIrZ57b0&s=10",
    rating: 9.2,
    year: 2024,
    status: "Ongoing",
    episodes: 24,
  },
  {
    id: 2,
    title: "Demon Slayer: Infinity Castle",
    poster:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-_3qTfhpgKD4OD9mIL5SPjIdRTkc0dBs0K3DvGSjdm1-D8Yr6PIrZ57b0&s=10",
    rating: 8.9,
    year: 2024,
    status: "Completed",
    episodes: 12,
  },
];

const themes = {
  dark: {
    bg: "bg-gray-900",
    surface: "bg-gray-800",
    text: "text-white",
    textSecondary: "text-gray-300",
    border: "border-gray-700",
    surfaceHover: "hover:bg-gray-700",
    input:
      "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500",
    accent: "bg-purple-600 hover:bg-purple-700",
  },
  light: {
    bg: "bg-gray-50",
    surface: "bg-white",
    text: "text-gray-900",
    textSecondary: "text-gray-600",
    border: "border-gray-200",
    surfaceHover: "hover:bg-gray-50",
    input:
      "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-purple-500",
    accent: "bg-purple-600 hover:bg-purple-700",
  },
};

export default function AnimeStreamingApp() {
  const [currentPath, setCurrentPath] = useState("/");
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const currentTheme = themes[theme];

  const navigate = (path) => setCurrentPath(path);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  // --- Google Login Setup ---
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id:
          "779631712094-6t77ptt5366r218o80pmijmeelboj25g.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  function handleCredentialResponse(response) {
    const payload = decodeJwtResponse(response.credential);
    setUser(payload);
  }

  function decodeJwtResponse(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  }

  function handleLogout() {
    setUser(null);
    if (window.google && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  // --- Sidebar ---
  const Sidebar = () => (
    <div
      className={`fixed left-0 top-0 h-full w-64 ${currentTheme.surface} border-r ${currentTheme.border} transform transition-transform duration-300 z-50 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <div className="p-6">
        <h1
          className={`text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent`}
        >
          AnimeStream+
        </h1>
        <nav className="mt-8 space-y-2">
          {[
            { path: "/", icon: Home, label: "Home" },
            { path: "/trending", icon: Tv, label: "Trending" },
            { path: "/genres", icon: Grid, label: "Genres" },
            { path: "/watchlist", icon: Bookmark, label: "My Watchlist" },
            { path: "/history", icon: History, label: "History" },
            { path: "/profile", icon: User, label: "Profile" },
          ].map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                currentPath === path
                  ? `${currentTheme.accent} text-white`
                  : `${currentTheme.textSecondary} ${currentTheme.surfaceHover}`
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  // --- Header ---
  const Header = () => (
    <header
      className={`${currentTheme.surface} border-b ${currentTheme.border} sticky top-0 z-40`}
    >
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden ${currentTheme.textSecondary}`}
          >
            <Menu size={24} />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${currentTheme.textSecondary}`}
              size={20}
            />
            <input
              type="text"
              placeholder="Search anime..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${currentTheme.input}`}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${currentTheme.surfaceHover}`}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Bell className={currentTheme.textSecondary} size={20} />

          {user ? (
            <div className="flex items-center space-x-2">
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className={`${currentTheme.text} font-medium`}>
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div id="google-btn"></div>
          )}
        </div>
      </div>
    </header>
  );

  // --- Home Page ---
  const HomePage = () => (
    <div className="space-y-8">
      <h1 className={`text-3xl font-bold ${currentTheme.text}`}>
        Welcome {user ? user.name : "Guest"}!
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockAnimeData.map((anime) => (
          <div
            key={anime.id}
            className={`${currentTheme.surface} rounded-lg p-4 cursor-pointer ${currentTheme.surfaceHover}`}
          >
            <img
              src={anime.poster}
              alt={anime.title}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 className={`${currentTheme.text} font-bold`}>{anime.title}</h3>
            <p className={currentTheme.textSecondary}>{anime.year}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${currentTheme.bg}`}>
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="p-6">
          <HomePage />
        </main>
      </div>
    </div>
  );
      }
         
