# CODEX.md - Codex Configuration for Talkd

## Read First
Always read `AGENTS.md` before starting any task.

## Project
**App:** Talkd - anonymous real-time peer-to-peer chat
**Expo:** 54.0.33 (LOCKED - never upgrade)
**Stack:** React Native + Expo 54.0.33 + Supabase + TypeScript strict
**Styling:** React Native inline styles + theme tokens. No NativeWind.
**Auth:** Supabase Auth (Apple + Email implemented; Phone OTP TODO)
**Real-time:** Supabase Realtime (no Socket.io)
**Stage:** MVP - iOS only

## Workflow
1. Read `AGENTS.md` -> current phase + active task.
2. Read the relevant `agent_docs/` file.
3. For feature work, propose a 2-5 bullet plan and wait for approval.
4. Implement one feature at a time.
5. Run `npx.cmd tsc --noEmit` and `npx.cmd eslint .` after changes.
6. Keep changes scoped and do not rewrite unrelated files.

## Commands
```bash
npx.cmd expo start
npx.cmd expo start --ios
npx.cmd tsc --noEmit
npx.cmd eslint .
npx.cmd supabase db push
npx.cmd supabase gen types typescript --local > types/supabase.ts
```

## Current Product Decisions
- NativeWind is intentionally not used.
- Keep the current 6 topics: Mental Health, Relationships, Career & Decisions, Late-Night, General Advice, Anything.
- Keep `MATCH_TIMEOUT_MS = 90_000`.
- Phone OTP is an explicit TODO.

## Hard Rules
- Expo 54.0.33 - never upgrade.
- Messages never stored in DB.
- Moderation before every chat message send.
- All users shown as "Anonymous".
- Report + Exit always visible in chat.
- Crisis popup: 5s lock minimum.
- TypeScript strict - `any` forbidden.
- Do not change topics or match timeout without explicit instruction.

## Docs
- Rules -> `AGENTS.md`
- Tech + setup -> `agent_docs/tech_stack.md`
- Patterns -> `agent_docs/code_patterns.md`
- Features -> `agent_docs/product_requirements.md`
- Testing -> `agent_docs/testing.md`
