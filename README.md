# Werewolf Game Server (deploy-ready)

Files in this repo provide a simple CommonJS Node + Socket.IO server with a minimal frontend (public/) and JSONBin integration for persistent metadata.

## Quick start (local)
1. Copy files into a folder.
2. `npm install`
3. Create a JSONBin bin for master and paste the bin id + master key into `.env` or environment variables.
4. `cp .env.example .env` and edit values.
5. `npm run dev` (requires nodemon) or `npm start`.
6. Open `http://localhost:3000`.

## Deploy notes
- The server uses Socket.IO (long-running). For hosting we recommend **Railway**, **Render**, or **Fly**. Vercel's serverless functions are not ideal for Socket.IO.
- On deploy, set environment variables (MASTER_BIN_ID, MASTER_API_KEY, ADMIN_EMAIL, GOOGLE_CLIENT_ID).

## JSONBin structure
Use `jsonbin-master-template.json` as the initial content for your master bin. The server expects master bin to contain at least `{ "credentials": [], "rooms": {} }`.

## Admin account
The email set in `ADMIN_EMAIL` (default `hanzgantengno1@gmail.com`) will automatically be an admin on login.

## Customization
- Game logic (role distribution, day/night phases) is intentionally left minimal in server.js to keep the project lightweight; you can integrate your existing `werewolf.js` game logic into the Socket.IO events.