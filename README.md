<div align="center">
<img width="1200" height="475" alt="Yield Autopilot" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Yield Autopilot - Full-Stack DeFi Application

A complete DeFi yield optimization platform combining a **React frontend** and **Express.js backend** with Gemini AI integration and PostgreSQL database.

## Features

- 🤖 **AI-Powered Chat** - Gemini-powered DeFi coach for yield recommendations
- 📊 **Yield Analytics** - Real-time yield data from DeFi protocols on Arbitrum
- 💰 **Portfolio Management** - Track wallets and transactions
- 🔗 **Smart Contract Integration** - Wallet connection and transaction logging
- 💾 **Persistent Database** - PostgreSQL with conversation and transaction history

## Architecture

```
metapilot/
├── src/
│   ├── components/          # React components
│   ├── backend/
│   │   ├── db/              # Database setup & pool
│   │   ├── routes/          # API endpoints
│   │   └── services/        # Business logic (Gemini, DeFi research)
│   └── App.tsx, main.tsx
├── server.ts                # Full-stack Express + Vite server
├── package.json
├── .env                     # Configuration (API keys, DB)
└── vite.config.ts
```

## Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 12+ (local or cloud)
- **Gemini API Key** - Get it at [https://aistudio.google.com](https://aistudio.google.com)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/yield_autopilot
PORT=3000
NODE_ENV=development
```

### 3. Setup Database

**Option A: Local PostgreSQL**
```bash
# Create database
createdb yield_autopilot

# Initialize schema
npm run db:init
```

**Option B: Supabase (Recommended for Production)**
1. Create a project at [supabase.com](https://supabase.com)
2. Get your connection string from Settings → Database
3. Update `DATABASE_URL` in `.env`
4. Run: `npm run db:init`

### 4. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`
Frontend dev server: `http://localhost:5173` (via Vite)

## Available Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Build for production
npm run start     # Run production build
npm run db:init   # Initialize database schema
npm run clean     # Clean build artifacts
npm run lint      # Check TypeScript
```

## API Routes

### Users
- `POST /api/users/connect` - Connect wallet
- `GET /api/users/:walletAddress` - Get user profile & stats

### Chat
- `POST /api/chat/conversations` - Start new conversation
- `GET /api/chat/conversations/:walletAddress` - List conversations
- `GET /api/chat/conversations/:conversationId/messages` - Get messages
- `POST /api/chat/message` - Send message & get AI response (supports streaming with `?stream=true`)

### Yields
- `GET /api/yields` - List opportunities (filterable by `?risk=low|medium|high` and `?token=USDC`)
- `GET /api/yields/summary` - Quick yield summary

### Transactions
- `POST /api/transactions` - Log transaction
- `PATCH /api/transactions/:txHash/status` - Update tx status
- `GET /api/transactions/:walletAddress` - Get tx history

### Health
- `GET /health` - Health check
- `GET /api/status` - API status

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini model used by chat and checks | `gemini-2.5-flash` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |

## Database Schema

Tables:
- **users** - Wallet addresses and usernames
- **conversations** - Chat sessions
- **messages** - Chat message history
- **transactions** - On-chain transaction logs

## Deployment

### Build for Production
```bash
npm run build
```

Creates:
- `dist/` - Frontend (React)
- `dist/server.js` - Backend (Node.js)

### Deploy with Node.js
```bash
npm start
```

## Technology Stack

**Frontend**
- React 19
- TypeScript
- Tailwind CSS
- Vite
- Recharts (charts)

**Backend**
- Express.js
- PostgreSQL
- Google Generative AI (Gemini)
- Axios (API calls)

## Troubleshooting

**"GEMINI_API_KEY not found"**
- Ensure `.env` file exists and has `GEMINI_API_KEY=your_key`

**Database connection errors**
- Check PostgreSQL is running: `psql --version`
- Verify `DATABASE_URL` in `.env`
- Run: `npm run db:init`

**Port 3000 already in use**
- Change `PORT` in `.env` to another port (e.g., `3001`)

## Performance Notes

- Yield data is cached for 5 minutes to reduce API calls
- Chat uses streaming for snappy responses
- Database indexes on commonly queried fields for fast lookups

## License

MIT

---

**Built for Arbitrum.** Questions? Check the issues or contact the team!
