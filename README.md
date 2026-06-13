# RabtPoint MERN App

Local frontend: http://localhost:5173
Local backend: http://localhost:5000
Website frontend: set VITE_WEBSITE_URL in client/.env
Website backend: set WEBSITE_URL in server/.env

Setup:
1. Copy server/.env.example to server/.env
2. Copy client/.env.example to client/.env (if present)
3. Run npm run install:all
4. Run from project root: npm run dev   (starts backend + frontend together)
5. Backend only: cd server && npm run dev
6. Frontend only: cd client && npm run dev

If OTP/API fails locally:
- Ensure backend shows "API running on http://localhost:5000"
- If MongoDB SRV DNS fails, set MONGO_URI_STANDARD in server/.env (non-SRV mongodb:// URI from Atlas)
- Without RESEND_API_KEY, dev OTP prints in server terminal and signup screen
