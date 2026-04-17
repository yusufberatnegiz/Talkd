# AGENTS.md — Talkd Master Instruction File
**Read this file first. Every time. Before writing a single line of code.**

---

## What Is Talkd?

Talkd is an anonymous, real-time peer-to-peer conversation app for iOS (React Native Expo 54.0.33).
Two users match by topic + role, chat for 15 minutes, then the session closes and messages are permanently deleted.
All users are shown as "Anonymous" to each other — no aliases, no names.

**Tagline:** The right person, right now, no judgment.

---

## Tech Stack (Never Change Without Explicit Instruction)

| Layer | Technology | Version |
|---|---|---|
| Mobile | React Native + Expo | **54.0.33 — LOCKED** |
| Routing | Expo Router v3 | Included in Expo 54 |
| Language | TypeScript | 5.x strict |
| Styling | NativeWind v4 | Tailwind for RN |
| Theme | System default | useColorScheme() |
| State | Zustand | Latest stable |
| Backend + DB + Auth + Realtime | Supabase | v2 |
| Auth methods | Supabase Auth | Apple + Email + Phone |
| Moderation | OpenAI Moderation API | Latest |
| Push | Expo Notifications | 54-compatible |
| Errors | Sentry | 54-compatible |

**Expo 54.0.33 is locked. Do not run `expo upgrade`. Do not change the expo version in package.json.**

---

## How I Should Think

1. **Read before coding.** Check `AGENTS.md` + relevant `agent_docs/` file before any task.
2. **Plan first.** Propose 2–5 bullet plan, wait for approval, then implement.
3. **One feature at a time.** Build → test → confirm → move on.
4. **Verify after every change.** Run `npx tsc --noEmit` and `npx eslint .` after each feature.
5. **Ask one question.** If unclear, ask ONE specific question before proceeding.
6. **Be concise.** No filler. State the issue, fix it.

---

## Project Phases

### ✅ Phase 0 — Setup
- [ ] Expo 54.0.33 project initialized
- [ ] NativeWind v4 configured
- [ ] Supabase client connected
- [ ] Supabase Auth working (Apple + Email + Phone)
- [ ] Environment variables configured
- [ ] App runs on iOS simulator without errors

### 🏗️ Phase 1 — Auth + Identity (CURRENT)
**Goal:** User signs in (Apple/Email/Phone), sees "Anonymous" display, completes onboarding, lands on Home.

- [ ] F01: Supabase Auth — Apple Sign In
- [ ] F01: Supabase Auth — Email signup/login
- [ ] F01: Supabase Auth — Phone OTP
- [ ] F01: Onboarding flow (3 screens)
- [ ] F01: Auth guard on (app) routes
- [ ] F01: Profile row created in `profiles` table on first sign in

**Done when:** New user opens app, signs in with Apple, completes onboarding, sees Home screen. Other users see them as "Anonymous".

### Phase 2 — Matching
- [ ] F02: Topic selection UI (3 categories)
- [ ] F03: Role + intent selection
- [ ] F02: Supabase Realtime match queue
- [ ] Matching screen with estimated wait time (< 60s) or "Finding someone..."
- [ ] 30s timeout → async fallback

### Phase 3 — Chat
- [ ] F04: Real-time chat via Supabase Realtime channel
- [ ] F05: 15-min session timer (warning at 2:00, auto-close at 0:00)
- [ ] F07: OpenAI moderation on every message
- [ ] F07: Crisis popup (5s lock + hotlines + listener guidance)
- [ ] F08: Report + Exit always visible in header
- [ ] System theme (light/dark)

### Phase 4 — Post-Session + Async
- [ ] F05b: Post-session rating (1-5 stars + labels)
- [ ] F06: Async fallback screen
- [ ] F06: Push notification when async message answered
- [ ] F09: Re-engagement push after 48h inactivity

### Phase 5 — Polish + Launch
- [ ] Settings screen
- [ ] Sentry active
- [ ] All type checks pass
- [ ] TestFlight beta (10 users)
- [ ] App Store submission

---

## Non-Negotiable Rules

1. **Messages never stored in DB.** Relay via Supabase Realtime only.
2. **Moderation before every send.** `moderateMessage()` before `channel.send()`. Always.
3. **All users display as "Anonymous".** No aliases. No custom names.
4. **Session = 900 seconds.** Use `SESSION_DURATION_SECONDS` constant. Never hardcode.
5. **Expo 54.0.33.** Never upgrade. Never change expo version.
6. **Report + Exit always visible** in chat header. Never hidden.
7. **Crisis popup: 5-second lock** before dismiss enabled.
8. **`clearSession()` on every session end.** Messages wiped immediately.
9. **TypeScript strict.** `any` is forbidden.
10. **Rating is anonymous.** No `user_id` in `session_ratings`.
11. **Async messages expire 24h.** Enforced at insert time.
12. **Re-engagement push after 48h inactivity.**

---

## What NOT To Do

- Do NOT upgrade Expo from 54.0.33
- Do NOT store message content in the database
- Do NOT show any identifier other than "Anonymous" to other users
- Do NOT call `channel.send()` without calling `moderateMessage()` first
- Do NOT hide the report button
- Do NOT use `any` type
- Do NOT add features outside the current phase
- Do NOT modify the DB schema without stating the change and waiting for approval
- Do NOT install new dependencies without listing them first

---

## File Reference

| Need info about... | Read this |
|---|---|
| Full tech stack + setup | `agent_docs/tech_stack.md` |
| Code patterns + examples | `agent_docs/code_patterns.md` |
| Features + acceptance criteria | `agent_docs/product_requirements.md` |
| Testing strategy | `agent_docs/testing.md` |
| Project conventions | `agent_docs/project_brief.md` |
| DB schema | `TDD_v1.1.md` Section 4 |
| Realtime event types | `talkd-mobile/types/realtime-events.ts` |

---

## Key Commands

```bash
# Mobile
npx expo start
npx expo start --ios
npx tsc --noEmit          # Type check
npx eslint . --ext .ts,.tsx

# Supabase
npx supabase db push
npx supabase gen types typescript --local > types/supabase.ts
```

---

## Current Active Task

**Phase:** Phase 1 — Auth + Identity
**Next:** Initialize Expo 54.0.33 project with NativeWind + Supabase Auth
**Start with:** `agent_docs/tech_stack.md` → Section: Project Setup
