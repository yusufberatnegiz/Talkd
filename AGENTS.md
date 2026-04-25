# AGENTS.md - Talkd Master Instruction File
**Read this file first. Every time. Before writing a single line of code.**

---

## What Is Talkd?

Talkd is an anonymous, real-time peer-to-peer conversation app for iOS (React Native Expo 54.0.33).
Two users match by topic + role, chat for 15 minutes, then the session closes and messages are permanently deleted.
All users are shown as "Anonymous" to each other - no aliases, no names.

**Tagline:** The right person, right now, no judgment.

---

## Tech Stack (Never Change Without Explicit Instruction)

| Layer | Technology | Version |
|---|---|---|
| Mobile | React Native + Expo | **54.0.33 - LOCKED** |
| Routing | Expo Router | SDK 54 compatible |
| Language | TypeScript | 5.x strict |
| Styling | React Native inline styles + theme tokens | No NativeWind |
| Theme | Custom theme tokens + system preference setting | `useTheme()` / `useAppearance()` |
| State | React state/hooks; Zustand only if a shared store is needed | Latest stable if added |
| Backend + DB + Auth + Realtime | Supabase | v2 |
| Auth methods | Supabase Auth | Apple + Email now; Phone OTP TODO |
| Moderation | OpenAI Moderation API | Latest |
| Push | Expo Notifications | 54-compatible |
| Errors | Sentry | 54-compatible |

**Expo 54.0.33 is locked. Do not run `expo upgrade`. Do not change the expo version in package.json.**

**NativeWind is intentionally not used. Do not add NativeWind or Tailwind unless explicitly requested.**

---

## How I Should Think

1. **Read before coding.** Check `AGENTS.md` + relevant `agent_docs/` file before any task.
2. **Plan first.** Propose 2-5 bullet plan, wait for approval, then implement.
3. **One feature at a time.** Build -> test -> confirm -> move on.
4. **Verify after every change.** Run `npx.cmd tsc --noEmit` and `npx.cmd eslint .` on Windows.
5. **Ask one question.** If unclear, ask ONE specific question before proceeding.
6. **Be concise.** No filler. State the issue, fix it.

---

## Project Phases

### Phase 0 - Setup
- [x] Expo 54.0.33 project initialized
- [x] React Native inline style/theme-token approach selected
- [x] Supabase client connected
- [ ] Supabase Auth working (Apple + Email complete; Phone OTP TODO)
- [ ] Environment variables configured
- [ ] App runs on iOS simulator without errors

### Phase 1 - Auth + Identity (CURRENT)
**Goal:** User signs in with Apple or Email now, Phone OTP later, sees "Anonymous" display, completes onboarding, lands on Home.

- [x] F01: Supabase Auth - Apple Sign In
- [x] F01: Supabase Auth - Email signup/login
- [ ] F01: Supabase Auth - Phone OTP
- [ ] F01: Onboarding flow (3 screens)
- [x] F01: Auth guard on app routes
- [ ] F01: Profile row created in `profiles` table on first sign in

**Done when:** New user opens app, signs in with Apple or Email, completes onboarding, sees Home screen. Other users see them as "Anonymous". Phone OTP remains an explicit TODO until implemented.

### Phase 2 - Matching
- [x] F02: Topic selection UI using the current 6 topics
- [x] F03: Role + intent selection
- [x] F02: Supabase Realtime match queue
- [x] Matching screen with estimated wait time or "Finding someone..."
- [x] 90s timeout -> async fallback

### Phase 3 - Chat
- [x] F04: Real-time chat via Supabase Realtime channel
- [x] F05: 15-min session timer with warning at 2:00
- [x] F07: OpenAI moderation on every message
- [x] F07: Crisis popup (5s lock + hotlines)
- [x] F08: Report + Exit always visible in header
- [x] Theme tokens with appearance preference

### Phase 4 - Post-Session + Async
- [x] F05b: Post-session rating (1-5 stars + labels/badges)
- [x] F06: Async fallback screen
- [ ] F06: Push notification when async message answered
- [ ] F09: Re-engagement push after 48h inactivity

### Phase 5 - Polish + Launch
- [x] Settings/profile screen
- [ ] Sentry active
- [ ] All type checks pass
- [ ] TestFlight beta (10 users)
- [ ] App Store submission

---

## Current Product Decisions

- Current topic set stays as-is: Mental Health, Relationships, Career & Decisions, Late-Night, General Advice, Anything.
- Current matching timeout stays as-is: `MATCH_TIMEOUT_MS = 90_000`.
- Phone OTP is not implemented yet and should remain marked TODO.
- NativeWind is not part of this codebase.

---

## Non-Negotiable Rules

1. **Messages never stored in DB.** Relay via Supabase Realtime only.
2. **Moderation before every chat message send.** `moderateMessage()` before chat message broadcast. Always.
3. **All users display as "Anonymous".** No aliases. No custom names.
4. **Session = 900 seconds.** Use `SESSION_DURATION_SECONDS` constant. Never hardcode.
5. **Expo 54.0.33.** Never upgrade. Never change expo version.
6. **Report + Exit always visible** in chat header. Never hidden.
7. **Crisis popup: 5-second lock** before dismiss enabled.
8. **Messages wiped on every session end.**
9. **TypeScript strict.** `any` is forbidden.
10. **Rating is anonymous.** Do not expose ratings to the other user.
11. **Async messages expire 24h.** Enforced when async persistence is implemented.
12. **Re-engagement push after 48h inactivity.**

---

## What NOT To Do

- Do NOT upgrade Expo from 54.0.33.
- Do NOT add NativeWind or Tailwind without explicit instruction.
- Do NOT store message content in the database.
- Do NOT show any identifier other than "Anonymous" to other users.
- Do NOT call chat `channel.send()` for messages without calling `moderateMessage()` first.
- Do NOT hide the report button.
- Do NOT use `any` type.
- Do NOT change the current topic set unless explicitly requested.
- Do NOT change the current 90s match timeout unless explicitly requested.
- Do NOT install new dependencies without listing them first.

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
| Realtime event types | Current realtime usage in `app/match.tsx`, `app/listener.tsx`, `app/chat.tsx` |

---

## Key Commands

```bash
# Mobile
npx.cmd expo start
npx.cmd expo start --ios
npx.cmd tsc --noEmit
npx.cmd eslint .

# Supabase
npx.cmd supabase db push
npx.cmd supabase gen types typescript --local > types/supabase.ts
```

---

## Current Active Task

**Phase:** Phase 1 - Auth + Identity
**Next:** Finish Phone OTP and first-sign-in profile creation.
**Start with:** `agent_docs/tech_stack.md` -> Section: Auth: Apple + Email + Phone OTP TODO
