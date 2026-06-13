# Newsletter POC

Double opt-in newsletter subscription with email verification.

## Architecture

```
Frontend (Vercel)  ──POST /api/subscribe──→  Backend API (Vercel)
  Static HTML/CSS/JS     ←─ JSON ──────     FastAPI + SQLite (/tmp)
```

## URLs

| Component | URL |
|-----------|-----|
| Frontend | https://newsletter-poc-frontend.vercel.app |
| Backend API | https://newsletter-poc-nine.vercel.app/api |
| API Docs (Swagger) | https://newsletter-poc-nine.vercel.app/api/docs |
| Subscribers | https://newsletter-poc-nine.vercel.app/api/subscribers |

## Flow

1. User enters email → real-time format validation
2. Clicks Subscribe → math CAPTCHA challenge
3. Correct answer → POST to `/api/subscribe`
4. Backend creates unverified subscriber → sends verification email via Gmail SMTP
5. User clicks link → `GET /api/verify/{token}` → subscriber marked verified

## Deploy

Push to `main` → Vercel auto-deploys both projects.

### Environment Variables (Backend)

| Variable | Value |
|----------|-------|
| `EMAIL_ADDRESS` | Gmail address |
| `EMAIL_PASSWORD` | Gmail app password (16-char) |
| `BASE_URL` | `https://newsletter-poc-nine.vercel.app/api` |
| `DATABASE_URL` | `sqlite:///newsletter.db` |

### Frontend

- Root Directory: `frontend` / Framework: Other / No env vars needed
- API URL hardcoded in `frontend/config.js`

## Commands

```bash
uvicorn backend.app:app --reload      # Local backend
git push origin main                  # Deploy
```

## Caveats

- SQLite in `/tmp/` — data lost on cold starts/redeploys
- Replace with PostgreSQL for production (e.g. Supabase free tier)
