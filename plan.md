# MetaPilot Integration Plan

## Current Merge Decision

Use `metapilot` as the full-stack app. It already contains the React frontend and an embedded Express backend under `src/backend`, so the separate `yield-autopilot` backend should be treated as the source for backend refinements, not as a second server to run beside it.

## Added From The Backend Review

- Keep one server entrypoint: `server.ts`.
- Mount API routes before Vite/static frontend middleware.
- Keep the catch-all 404 after frontend middleware so the app can render in dev and production.
- Build the server as ESM because it uses `import.meta.url`.
- Add `/api/gemini/chat` because the frontend calls that route directly.
- Preserve `/api/chat/*` for persistent conversation storage.
- Validate wallet addresses, transaction hashes, UUIDs, amounts, and text fields before database queries.
- Verify chat conversation ownership before writing messages.
- Improve DeFi Llama filtering by normalizing protocol names and token symbols.
- Return fallback yield data when DeFi Llama is unreachable or returns no usable pools.
- Let AI chat run in local fallback mode when `GEMINI_API_KEY` is missing.

## Next Useful Additions

- Wire frontend wallet connect to `POST /api/users/connect`.
- Save real chat sessions through `/api/chat/conversations` and `/api/chat/message` instead of only the compatibility `/api/gemini/chat` route.
- Log confirmed execution plans to `POST /api/transactions`.
- Add a production database migration step to deployment docs.
- Replace simulated balances with wallet/provider balances when a real wallet is connected.

## Verification Targets

- `npm run lint`
- `npm run build`
- `npm run dev`
- `GET /api/status`
- `POST /api/gemini/chat`
- `GET /api/yields/summary`
