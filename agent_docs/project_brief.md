# Project Brief — Talkd

## Vision
Give people a safe space to talk to a real human, anonymously, right now.
Not a therapist. Not AI. Not Reddit. A stranger who gets it.

## What Makes This Different
Real-time + Real human + Anonymous — no competitor has all three.

## Locked Technical Decisions
- Expo 54.0.33 — never upgrade
- Messages never stored (relay only via Supabase Realtime)
- All users display as "Anonymous" — no aliases
- Session = 15 minutes (900s)
- Supabase all-in-one (auth + DB + realtime)
- Rating is anonymous (no user_id)

## Conventions
```
Components:    PascalCase  → MessageBubble.tsx
Hooks:         camelCase   → useSession.ts
Routes:        kebab-case  → role-select.tsx
Constants:     SCREAMING   → SESSION_DURATION_SECONDS
Stores:        useXxxStore → useMatchStore
```

## Quality Gates
- TypeScript strict — `any` forbidden
- Pre-commit: `npx tsc --noEmit && npx eslint .`
- Business logic in hooks/services — never inline in screens
- Errors always captured by Sentry

## Key Commands
```bash
npx expo start
npx expo start --ios
npx tsc --noEmit
npx eslint . --ext .ts,.tsx
npx supabase db push
npx supabase gen types typescript --local > types/supabase.ts
```

## Update Rules
- Update `MEMORY.md` after every completed task
- Update `AGENTS.md` when a new phase starts
- Update `agent_docs/tech_stack.md` if any dependency changes
