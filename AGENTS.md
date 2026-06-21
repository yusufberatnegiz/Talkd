# AGENTS.md - Talkd Master Instruction File

**Read this file first. Every time. Before writing a single line of code.**

This is the master instruction file for Talkd.  
`CODEX.md` and `CLAUDE.md` should only be short summaries that point back to this file.

---

## 1. What Is Talkd?

Talkd is an anonymous, real-time peer-to-peer advice chat app for iOS.

Users choose a topic and role, match with a stranger, and chat in real time for a limited session.  
The other person is always shown as **Anonymous**.

**Tagline:** The right person, right now, no judgment.

Core promise:

- anonymous conversations
- real-time matching
- no public profiles
- no names, aliases, usernames, or avatars
- chat messages are not stored in the database
- safety systems exist through moderation, reports, ratings, and session metadata

Important:  
Talkd must not claim “end-to-end encrypted” unless real E2EE is implemented.

---

## 2. Tech Stack

Do not change these without explicit instruction.

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo |
| Expo SDK | **54.0.33 - LOCKED** |
| Routing | Expo Router |
| Language | TypeScript strict |
| Styling | React Native inline styles + custom theme tokens |
| Backend | Supabase |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Database | Supabase Postgres |
| Moderation | OpenAI Moderation API through Supabase Edge Function |
| Push | Expo Notifications |
| Error monitoring | Sentry |

### Locked decisions

- Expo version is locked at **54.0.33**.
- Do not run `expo upgrade`.
- Do not change the Expo version in `package.json`.
- Do not add NativeWind or Tailwind.
- Do not add Socket.io.
- Do not replace Supabase.
- Do not install new dependencies unless explicitly needed and explained first.

---

## 3. Current Product Decisions

Keep these unless explicitly instructed otherwise.

### Topics

Current topic set:

- Mental Health
- Relationships
- Career & Decisions
- Late-Night
- General Advice
- Anything

Do not change this topic set without explicit instruction.

### Matching

Current matching timeout:

```ts
MATCH_TIMEOUT_MS = 90_000
```

Do not change this unless explicitly instructed.

### Chat session duration

Current session duration:

```ts
SESSION_DURATION_SECONDS = 900
```

Do not hardcode `900` elsewhere. Always use the constant.

### Identity

All users must appear to each other as:

```txt
Anonymous
```

Never show:

- email
- user ID
- username
- display name
- avatar
- alias
- profile metadata

### Phone OTP

Phone OTP is a TODO.  
Do not prioritize it until stabilization/safety tasks are complete.

---

## 4. Current Priority

Current phase: **Phase 0 - Stabilization and Safety**

Priority order:

1. Fix dependency/build compatibility.
2. Fix misleading privacy/security copy.
3. Align Supabase schema with app code.
4. Move OpenAI moderation out of the mobile client into a Supabase Edge Function.
5. Fix matchmaking reliability.
6. Fix ratings/reports/safety enforcement.
7. Fix auth verification and onboarding.
8. Continue Phone OTP later.

Do not start new UI polish or extra features before these foundations are stable.

---

## 5. Non-Negotiable Rules

### Privacy and data

1. Chat messages must never be stored in the database.
2. Chat messages may only be relayed through Supabase Realtime.
3. Messages must be wiped from local state when the session ends.
4. Session metadata may be stored.
5. Matchmaking queue rows may be stored.
6. Reports may be stored.
7. Ratings may be stored.
8. Private rating notes must never be exposed publicly.
9. Do not claim “end-to-end encrypted” unless real E2EE exists.
10. Do not claim “no records” if metadata, ratings, reports, queue rows, or safety records are stored.
11. Do not claim “permanently deletes account” unless real account deletion is implemented.

### Moderation and safety

12. `moderateMessage()` must run before every chat message broadcast.
13. Never call chat `channel.send()` for a user message before moderation succeeds.
14. OpenAI API keys must never be exposed in the mobile client.
15. No `EXPO_PUBLIC_OPENAI_API_KEY`.
16. No `dangerouslyAllowBrowser` OpenAI client usage in the mobile app.
17. OpenAI moderation must run through a server-side Supabase Edge Function.
18. Crisis popup must keep the 5-second lock before dismiss.
19. Report + Exit must always be visible in the chat header.
20. Users must be able to leave/report quickly from every chat session.
21. Talkd must not present anonymous stranger advice as therapy, medical advice, legal advice, or emergency support.

### Identity

22. All users display as `Anonymous`.
23. Do not show names, emails, IDs, avatars, or usernames to other users.
24. Ratings are anonymous.
25. Do not expose who rated whom to users.

### Engineering

26. TypeScript strict mode must pass.
27. `any` is forbidden.
28. Keep changes scoped.
29. Do not rewrite unrelated files.
30. Do not install dependencies unless needed and explained.
31. Do not upgrade Expo.
32. Do not add NativeWind.
33. Do not change the current topic set.
34. Do not change the current match timeout.
35. Do not hardcode session duration.

---

## 6. Required Workflow

For every task:

1. Read `AGENTS.md`.
2. Read the relevant file in `agent_docs/`.
3. Inspect the current implementation before editing.
4. Make a short 2-5 bullet plan.
5. Implement one focused change.
6. Run checks.
7. Summarize changed files and behavior.

For feature work, propose the plan first and wait for approval unless the user explicitly says to implement directly.

For bug fixes, implement directly if the issue is clear and scoped.

---

## 7. Required Checks

Run after code changes on Windows:

```bash
npx.cmd tsc --noEmit
npx.cmd eslint .
```

For Expo runtime testing:

```bash
npx.cmd expo start
npx.cmd expo start --ios
```

For Supabase:

```bash
npx.cmd supabase db push
npx.cmd supabase gen types typescript --local > types/supabase.ts
```

If a command fails, fix the root cause or clearly report why it failed.

---

## 8. Project Phases

### Phase 0 - Stabilization and Safety - CURRENT

Goal: make the app build reliably and remove unsafe/misleading foundations.

- [ ] Dependency install works cleanly
- [ ] `npx.cmd tsc --noEmit` passes
- [ ] `npx.cmd eslint .` passes
- [ ] Privacy/security copy is truthful
- [ ] No false E2EE claims
- [ ] No OpenAI API key in mobile client
- [ ] Supabase schema matches app usage
- [ ] Matchmaking avoids duplicate-match race conditions
- [ ] Reports and ratings work with RLS
- [ ] Account deletion copy is truthful

### Phase 1 - Auth + Identity

Goal: user signs in, completes onboarding, and lands on Home as Anonymous.

- [x] Apple Sign In
- [x] Email signup/login
- [ ] Email verification UX confirmed
- [ ] Phone OTP TODO
- [ ] Onboarding flow
- [ ] Profile row created on first sign-in
- [ ] Safety guideline acceptance stored

### Phase 2 - Matching

Goal: reliable matchmaking.

- [x] Topic selection UI
- [x] Role/intent selection
- [x] Matching screen
- [x] 90s timeout UI
- [ ] Server-authoritative match queue
- [ ] No self-match
- [ ] No duplicate queue rows
- [ ] No duplicate matches
- [ ] Cancel queue works
- [ ] Async fallback persistence TODO

### Phase 3 - Chat

Goal: safe real-time chat.

- [x] Realtime chat UI
- [x] 15-minute timer
- [x] 2-minute warning
- [x] Moderation before send
- [x] Crisis popup
- [x] Report + Exit visible
- [ ] Moderation moved to Edge Function
- [ ] Send failure does not erase draft
- [ ] Peer disconnect handled cleanly

### Phase 4 - Post-Session + Async

Goal: post-session quality and async fallback.

- [x] Rating UI
- [x] Badge/label UI
- [ ] Ratings schema aligned
- [ ] Reports schema aligned
- [ ] Temporary ban/cooldown enforcement
- [ ] Async messages expire after 24h when persistence is implemented
- [ ] Push notification when async message answered
- [ ] Re-engagement push after 48h inactivity

### Phase 5 - Polish + Launch

Goal: internal TestFlight.

- [ ] Sentry active
- [ ] Internal TestFlight with 10 users
- [ ] App Store privacy wording reviewed
- [ ] App Store submission

---

## 9. File Reference

| Need info about... | Read this |
|---|---|
| Tech stack + setup | `agent_docs/tech_stack.md` |
| Code patterns | `agent_docs/code_patterns.md` |
| Product requirements | `agent_docs/product_requirements.md` |
| Testing strategy | `agent_docs/testing.md` |
| Project conventions | `agent_docs/project_brief.md` |
| DB schema | `TDD_v1.1.md` Section 4, if present |
| Matching code | `app/match.tsx`, `app/listener.tsx` |
| Chat code | `app/chat.tsx` |
| Auth code | auth screens + root layout |
| Theme | theme files + `useTheme()` / `useAppearance()` |
| Supabase client | Supabase client file |
| Migrations | `supabase/migrations/` |

---

## 10. Supabase Rules

1. RLS must be enabled on all user-accessed tables.
2. Client must never use service role keys.
3. Service role keys may only be used inside Supabase Edge Functions.
4. User actions must be scoped to `auth.uid()`.
5. Users can only read/update data they are allowed to access.
6. Reports and ratings must verify session participation.
7. Users cannot directly update their own `report_count`.
8. Users cannot directly update their own `ban_expires_at`.
9. Chat messages must not be inserted into any table.
10. Matchmaking/session metadata can be stored.
11. Migrations must match all `supabase.from(...)` and `supabase.rpc(...)` usage.
12. If the app references a table/view/function, it must exist in migrations.

---

## 11. Realtime Rules

Supabase Realtime can be used for:

- ephemeral chat messages
- presence
- non-sensitive session signals

Supabase Realtime must not be the only source of truth for:

- final matchmaking decisions
- abuse enforcement
- bans
- account deletion
- ratings
- reports

Preferred architecture:

```txt
Matchmaking decision: database RPC or Edge Function
Live message relay: Supabase Realtime
Safety records: database with RLS
Moderation: Supabase Edge Function
```

---

## 12. Copy and Claims Rules

Do not write:

```txt
End-to-end encrypted
No records
Nothing is stored
Permanently deletes account
```

unless those statements are technically true.

Preferred wording:

```txt
Real-time anonymous chat
Messages are not saved after the session
Session metadata, reports, and ratings may be stored for safety and quality
```

---

## 13. Definition of Done

A task is done only when:

- The requested behavior is implemented.
- Unrelated files are not rewritten.
- No new false privacy/security claims are introduced.
- No client-side secrets are introduced.
- TypeScript passes.
- ESLint passes or failures are documented.
- Any required Supabase migration is added.
- Any required Edge Function deploy command is documented.
- The final response lists changed files and testing results.

---

## 14. Current Active Task

**Current phase:** Phase 0 - Stabilization and Safety

**Next task:** Fix dependency/build compatibility without changing Expo 54.0.33.

**Then:** fix truthful privacy copy, Supabase schema alignment, server-side moderation, and matchmaking reliability.
