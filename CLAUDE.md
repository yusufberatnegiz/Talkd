# CLAUDE.md — Claude Code Configuration for Talkd

## Read First
Always read `AGENTS.md` before starting any task.

## Project
**App:** Talkd — anonymous real-time peer-to-peer chat
**Expo:** 54.0.33 (LOCKED — never upgrade)
**Stack:** React Native + Expo 54.0.33 + Supabase + NativeWind + TypeScript strict
**Auth:** Supabase Auth (Apple + Email + Phone)
**Real-time:** Supabase Realtime (no Socket.io)
**Stage:** MVP — iOS only

## Workflow
1. Read `AGENTS.md` → current phase + active task
2. Read relevant `agent_docs/` file
3. Propose plan (2–5 bullets) → wait for approval
4. Implement one feature at a time
5. Run `npx tsc --noEmit && npx eslint .` after each change
6. Fix all errors before next task

## Commands
```bash
npx expo start
npx expo start --ios
npx tsc --noEmit
npx eslint . --ext .ts,.tsx
npx supabase db push
npx supabase gen types typescript --local > types/supabase.ts
```

## Hard Rules
- Expo 54.0.33 — never upgrade
- Messages never stored in DB
- Moderation before every message send
- All users shown as "Anonymous"
- Report + Exit always visible in chat
- Crisis popup: 5s lock minimum
- TypeScript strict — `any` forbidden
- Rating has no user_id (anonymous)

## Docs
- Rules → `AGENTS.md`
- Tech + setup → `agent_docs/tech_stack.md`
- Patterns → `agent_docs/code_patterns.md`
- Features → `agent_docs/product_requirements.md`
- Testing → `agent_docs/testing.md`
