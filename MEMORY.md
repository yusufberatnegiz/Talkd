# MEMORY.md — Talkd Active State
**Update after completing each task.**

---

## Active Phase & Goal
**Phase:** Phase 1 — Auth + Identity
**Goal:** User signs in, sees "Anonymous", completes onboarding, lands on Home.
**Started:** April 2026

---

## Completed Tasks
*(Move here when done)*
- Nothing yet

---

## In Progress
- [ ] Project initialization (Expo 54.0.33 + NativeWind + Supabase)

---

## Blockers
*None*

---

## Locked Decisions

| Decision | Value | Reason |
|---|---|---|
| Expo version | 54.0.33 | Locked — do not change |
| Session length | 15 min (900s) | Confirmed by founder |
| Backend | Supabase all-in-one | Simplest stack for MVP |
| Real-time | Supabase Realtime | No Socket.io needed |
| Auth | Supabase (Apple + Email + Phone) | Required by App Store |
| Display names | "Anonymous" only | Privacy by design |
| Theme | System default | Follows iPhone setting |
| Post-session | 1-5 stars + labels | Confirmed |
| Re-engagement push | After 48h inactivity | Confirmed |
| Rating anonymity | No user_id in ratings | Privacy |
| Language | English only (Turkish Phase 2) | Confirmed |
| Monetization | Freemium in Phase 2 | Confirmed |
| Messages in DB | Never stored | Core privacy requirement |

---

## Phase Log

| Phase | Status | Date |
|---|---|---|
| Phase 0 — Setup | Not started | - |
| Phase 1 — Auth | In progress | Apr 2026 |
| Phase 2 — Matching | Not started | - |
| Phase 3 — Chat | Not started | - |
| Phase 4 — Post-session + Async | Not started | - |
| Phase 5 — Polish + Launch | Not started | - |
