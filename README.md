# AnimeStream+ - Premium Streaming Platform

## 🚀 Quick Setup

1. **Create new folder**
   ```bash
   mkdir anime-streaming-platform
   cd anime-streaming-platform
   ```

2. **Copy all files** (sesuai struktur folder)

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Test locally**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

## 📁 Folder Structure
```
anime-streaming-platform/
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── styles/
│   └── globals.css
├── pages/
│   ├── _app.tsx
│   └── index.tsx
└── components/
    └── AnimeApp.tsx
```

## ⚙️ Environment Variables (Vercel)
Set these in Vercel dashboard:
```
GOOGLE_CLIENT_ID=779631712094-6t77ptt5366r218o80pmijmeelboj25g.apps.googleusercontent.com
ADMIN_EMAIL=hanzgantengno1@gmail.com
```

## 🔐 Admin Features
- Email: hanzgantengno1@gmail.com gets admin access
- Add/Edit/Delete anime
- User management
- Analytics dashboard

## ✅ Features Included
- Google OAuth login
- Admin panel for hanzgantengno1@gmail.com
- Anime management system
- Dark theme UI
- Mobile responsive
- TypeScript support

Your app will be live at: `https://your-app-name.vercel.app`