# mundial-prode — Claude Code Instructions

## Git & Deployment
- After every task, **commit, push to `origin main`, and let Vercel auto-redeploy**.
- No need to ask for confirmation — just do it.
- Use conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, etc.
- Vercel is connected to this repo and deploys automatically on push to `main`.

## Stack
- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- Prisma + PostgreSQL (Neon)
- NextAuth.js (credentials provider, JWT)
- Deployed on Vercel

## Project Context
- FIFA World Cup 2026 prediction game (prode)
- Users register (optionally picking a favorite national team) and predict match results each "fecha"
- Scoring: 5pts (correct pick + margin), 4pts (correct pick), 0pts (wrong)
- Margin: LESS_1 (≤1 goal difference) / MORE_1 (2+ goals difference)
- Tournament phases: GRUPOS, OCTAVOS, CUARTOS, SEMIFINAL, TERCER_PUESTO, FINAL
- Single global ranking (no divisions)
- 48 national teams with ISO alpha-2 flag codes via flagcdn.com
