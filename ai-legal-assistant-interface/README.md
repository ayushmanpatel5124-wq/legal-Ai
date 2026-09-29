# AI Legal Assistant using RAG

A fullstack rebuild of the single-file legal assistant prototype: Next.js (App Router) +
PostgreSQL (Drizzle ORM) with server-side retrieval, persistence and analysis.

Created by **Bhumistha Sahoo**.

## What changed versus the original HTML version

| Original | Now |
| --- | --- |
| localStorage history | `activity`, `conversations`, `messages`, `verifications` tables in Postgres |
| 9 hard-coded knowledge blobs | 25-entry curated legal corpus seeded into `legal_sources`, scored with term-frequency + keyword + authority weighting |
| Documents kept in the browser | Text extracted in browser, stored, chunked per page and indexed for Postgres full-text retrieval |
| Answers = one canned paragraph | Plain-language answer + legal reasoning with citations + next steps + evidence list + confidence/coverage metrics |
| Claim verification by regex | Retrieval-backed support/contradiction analysis with coverage and confidence |
| No API | REST API: `/api/chat`, `/api/conversations/:id`, `/api/verify`, `/api/documents`, `/api/research`, `/api/activity`, `/api/stats`, `/api/health` |

## Local development

```bash
npm install
echo "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db" > .env
npx drizzle-kit push      # create tables
npm run dev
```

The legal corpus seeds itself on first request (idempotent, keyed on `slug`).

## Deploying to Netlify

1. Push the repository to GitHub and create a new Netlify site from it.
2. Netlify detects `netlify.toml` and installs `@netlify/plugin-nextjs`
   (already a dependency), which deploys route handlers as functions.
3. Add an environment variable `DATABASE_URL` pointing at a hosted Postgres
   database (Neon, Supabase, Railway, RDS …). Use a pooled/serverless connection
   string and append `?sslmode=require` where the provider requires TLS.
4. Run `npx drizzle-kit push` once against that database (locally, with
   `DATABASE_URL` set) to create the schema.
5. Deploy. `/api/health` should return `{ "ok": true }`.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- PostgreSQL + Drizzle ORM (`src/db/schema.ts`)
- Retrieval engine in `src/lib/rag.ts`, corpus in `src/lib/corpus.ts`
- pdf.js / mammoth.js loaded on demand in the browser for text extraction
