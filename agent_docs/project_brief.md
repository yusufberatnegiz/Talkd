# Project Brief - Talkd

## Vision
Give people a safe space to talk to a real human, anonymously, right now.
Not a therapist. Not AI. Not Reddit. A stranger who gets it.

## What Makes This Different
Real-time + Real human + Anonymous - no competitor has all three.

## Locked Technical Decisions
- Expo 54.0.33 - never upgrade
- React Native inline styles + theme tokens - no NativeWind
- Messages never stored (relay only via Supabase Realtime)
- All users display as "Anonymous" - no aliases
- Session = 15 minutes (900s)
- Match fallback timeout = 90 seconds
- Current topics = Mental Health, Relationships, Career & Decisions, Late-Night, General Advice, Anything
- Supabase all-in-one (auth + DB + realtime)
- Phone OTP is TODO

## Conventions
```text
Components:    PascalCase  -> MessageBubble.tsx
Hooks:         camelCase   -> useSession.ts
Routes:        kebab-case  -> role-select.tsx
Constants:     SCREAMING   -> SESSION_DURATION_SECONDS
Theme tokens:  useTheme()  -> t.bg, t.ink, t.line
```

## Quality Gates
- TypeScript strict - `any` forbidden
- Pre-commit: `npx.cmd tsc --noEmit` and `npx.cmd eslint .`
- Prefer shared hooks/services for reusable business logic
- Errors should be captured by Sentry once Sentry is active

## Key Commands
```bash
npx.cmd expo start
npx.cmd expo start --ios
npx.cmd tsc --noEmit
npx.cmd eslint .
npx.cmd supabase db push
npx.cmd supabase gen types typescript --local > types/supabase.ts
```

## Update Rules
- Update `MEMORY.md` after every completed task
- Update `AGENTS.md` when a new phase starts
- Update `agent_docs/tech_stack.md` if any dependency or locked stack decision changes
