# MEMORY.md - Talkd Active State
**Update after completing each task.**

---

## Active Phase & Goal
**Phase:** Phase 1 - Auth + Identity
**Goal:** User signs in, sees "Anonymous", completes onboarding, lands on Home.
**Started:** April 2026

---

## Completed Tasks
- Expo 54.0.33 project initialized
- React Native inline style/theme-token approach selected
- Supabase client configured
- Apple sign-in screen flow added
- Email signup/login added
- Auth guard added
- Matching/chat/rating prototype screens exist
- Documentation updated to remove NativeWind and keep current topics/timeout
- `CODEX.md` created

---

## In Progress
- [ ] Phone OTP auth
- [ ] Profile row creation on first sign-in
- [ ] Onboarding completion persistence

---

## Blockers
*None*

---

## Locked Decisions

| Decision | Value | Reason |
|---|---|---|
| Expo version | 54.0.33 | Locked - do not change |
| Styling | React Native inline styles + theme tokens | NativeWind intentionally removed |
| Session length | 15 min (900s) | Confirmed |
| Match timeout | 90s | Keep current behavior |
| Topics | 6 current topics | Keep current behavior |
| Backend | Supabase all-in-one | Simplest stack for MVP |
| Real-time | Supabase Realtime | No Socket.io needed |
| Auth | Supabase Apple + Email; Phone OTP TODO | Current implementation |
| Display names | "Anonymous" only | Privacy by design |
| Theme | Theme tokens + appearance preference | Current implementation |
| Re-engagement push | After 48h inactivity | Confirmed |
| Language | English only | Confirmed |
| Messages in DB | Never stored | Core privacy requirement |

---

## Phase Log

| Phase | Status | Date |
|---|---|---|
| Phase 0 - Setup | In progress | Apr 2026 |
| Phase 1 - Auth | In progress | Apr 2026 |
| Phase 2 - Matching | Prototype exists | Apr 2026 |
| Phase 3 - Chat | Prototype exists | Apr 2026 |
| Phase 4 - Post-session + Async | Prototype exists | Apr 2026 |
| Phase 5 - Polish + Launch | Not started | - |
