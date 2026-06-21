# Product Requirements - Talkd

## Value Proposition

Talkd = Real-time + Real human + Anonymous.

Talkd helps users talk to a real stranger right now, without names, profiles, judgment, or public identity.

Session length: 15 minutes.  
Display name: `Anonymous`.  
No aliases.

---

## User Persona

Alex, 21, cannot open up to people close to him.

At 1am, he opens Talkd, picks a topic, and quickly talks to a stranger who gets it.

After the conversation, he feels lighter.

---

## Core Product Rules

- All users are shown as `Anonymous`.
- No PII is shown to other users.
- Chat messages are not stored in the database.
- Session metadata may be stored.
- Reports may be stored.
- Ratings may be stored.
- Moderation runs before every outbound message.
- Report + Exit are always visible in chat.
- Talkd is not therapy, medical advice, legal advice, or emergency support.

---

## F01 - Anonymous Identity

Auth:
- Apple implemented.
- Email implemented.
- Phone OTP is TODO.

Identity:
- Display name is always `Anonymous`.
- No aliases.
- No custom names.
- No avatars.
- No PII shown to other users.

Acceptance Criteria:
- [x] Sign in with Apple works
- [x] Email signup/login works
- [ ] Email verification UX confirmed
- [ ] Phone OTP works
- [x] Other users see anonymous identity language
- [ ] No PII on any user-facing screen
- [ ] Onboarding: 3 steps
- [ ] Safety guideline acceptance stored
- [ ] Profile row created on first sign-in

---

## F02 - Topic-Based Matching

Current MVP topics:
- Mental Health
- Relationships
- Career & Decisions
- Late-Night
- General Advice
- Anything

Matching priority:
1. Same topic + Talker <-> Listener
2. Same topic + Talker <-> Talker fallback
3. Never: Listener <-> Listener

Prototype status:
- Realtime broadcast matching exists.
- This is acceptable for prototype testing only.

Production requirement:
- Matchmaking should become server-authoritative through Supabase database RPC or Edge Function.
- Clients must not be the only source of truth for final match decisions.

Acceptance Criteria:
- [x] Current 6-topic UI exists
- [x] Prototype match via Supabase Realtime broadcast channels
- [x] 90s async fallback UI triggers
- [x] Matching screen shows wait state
- [x] Correct role pairing for Talker/Listener flow
- [ ] Production-safe server-authoritative match queue
- [ ] No self-match
- [ ] No duplicate queue rows per user
- [ ] No duplicate matches
- [ ] Cancel queue works reliably
- [ ] Banned/cooldown users cannot enter matchmaking

---

## F03 - Role + Intent Selection

- Talker chooses a topic and intent/context.
- Listener can go on duty and filter by topic.
- Intent/context can be shown during chat.

Acceptance Criteria:
- [x] Intent screen before match
- [x] Listener duty screen
- [x] Context note visible in chat
- [ ] Intent/context never exposes PII by design guidance
- [ ] Banned/cooldown users are blocked before role selection or queue entry

---

## F04 - Real-Time Chat

- Supabase Realtime broadcast channels.
- Messages are not stored in the database.
- Text only.
- Typing indicator.
- Message moderation before broadcast.

Acceptance Criteria:
- [x] Messages broadcast over realtime channel
- [x] No message insert code exists
- [x] Typing indicator exists
- [x] Moderation before send exists
- [ ] Moderation runs through Supabase Edge Function
- [ ] No OpenAI API key in Expo client
- [ ] Send failure does not erase draft
- [ ] Peer disconnect handled cleanly
- [ ] Current user is verified as session participant before joining chat

---

## F05 - Session Timer

- Duration: 900 seconds.
- Warning at 2:00.
- Uses `SESSION_DURATION_SECONDS`.

Acceptance Criteria:
- [x] Timer visible to both users
- [x] Warning state at 2:00
- [x] Messages wiped when session ends
- [ ] Timer does not conflict with manual exit
- [ ] Timer does not create duplicate navigation
- [ ] Session metadata is updated when session ends

---

## F05b - Post-Session Rating

- Appears after session end.
- Format: 1-5 stars + label/badge selection.
- Skip is available by submitting without a star/badge.
- Ratings are anonymous to users.

Acceptance Criteria:
- [x] Rating screen after session end
- [x] Stars and badges UI works
- [x] Skip/close path works
- [ ] Rating insert matches database schema
- [ ] Duplicate rating by same rater/session prevented
- [ ] Only session participants can rate
- [ ] Private notes are not exposed publicly
- [ ] Aggregated rating view exposes safe data only

---

## F06 - Async Fallback

- Triggers after the current 90s match timeout.
- User can leave an async note.
- Push notification on response is TODO.
- Expiry is 24 hours when async persistence is implemented.

Current status:
- Async fallback UI exists.
- Async persistence is not complete unless explicitly implemented.

Acceptance Criteria:
- [x] Fallback at 90s
- [x] Async note UI exists
- [ ] Async note is persisted safely
- [ ] Async note expires after 24h
- [ ] Push on response
- [ ] User can cancel/delete async note
- [ ] Async note storage does not conflict with “chat messages are not stored” rule

---

## F07 - Crisis Detection & Moderation

Moderation:
- OpenAI Moderation API runs on every outbound chat message.
- The mobile client calls a Supabase Edge Function.
- The OpenAI API key is only stored server-side.

Crisis categories:
- self-harm
- self-harm intent
- self-harm instructions

Crisis flow:
1. Crisis popup appears.
2. Dismiss action is locked for 5 seconds.
3. Shows hotline/resource guidance.
4. User can continue only after reading.

Acceptance Criteria:
- [x] Every chat message is moderated before send
- [x] Popup cannot dismiss for 5s
- [x] Crisis resources are shown
- [ ] OpenAI key is not exposed in client
- [ ] Moderation failure does not erase draft
- [ ] Mental Health topic has extra safety guidance
- [ ] App copy does not present Talkd as therapy or emergency help

---

## F08 - Report & Exit

- Report + Exit always visible in chat header.
- Exit in <= 2 taps.
- Report submits from chat UI.
- Reports must be tied to a session.

Acceptance Criteria:
- [x] Buttons always visible
- [x] Exit in <= 2 taps
- [x] Report submits from chat UI
- [ ] Reports table exists and matches app code
- [ ] Only session participants can report
- [ ] Duplicate report from same reporter/session prevented
- [ ] Reported user must be the other session participant
- [ ] Temporary ban/cooldown enforcement works
- [ ] Users cannot directly modify report counts or ban fields

---

## F09 - Push Notifications

- Re-engagement push after 48h inactivity.
- Push when async message receives a response.

Acceptance Criteria:
- [ ] Re-engagement push after 48h
- [ ] Async reply push works on physical device
- [ ] Notification permissions requested clearly
- [ ] Push tokens stored securely and scoped to user
- [ ] Push does not expose sensitive message content

---

## F10 - Safety Onboarding

Before first use, users should confirm lightweight safety guidance.

Required points:
- Talkd is not therapy, medical advice, legal advice, or emergency support.
- Do not share personally identifying information.
- Be respectful.
- Use Report and Exit if someone is abusive or uncomfortable.
- If in immediate danger or crisis, contact local emergency services or crisis resources.
- Messages are not saved after the session, but session metadata/reports/ratings may be stored for safety and quality.

Acceptance Criteria:
- [ ] Safety onboarding exists
- [ ] User must accept before first match
- [ ] Acceptance timestamp is stored
- [ ] Mental Health topic shows extra safety guidance
- [ ] Copy is short, clear, and not scary

---

## NOT in MVP

- Profile photos
- Friend/follow system
- Group chat
- Media sharing
- Web version
- Payments/subscriptions
- Voice/video
- More topics unless explicitly requested
- Turkish localization
- Android
- Premium features

---

## Success Metrics - First 30 Days

| Metric | Target |
|---|---|
| Active users | 100 |
| Conversations/user | 3+ |
| Match success rate | 70%+ |
| Session completion | 60%+ |
| Week 2 retention | 30%+ |
| Crisis accuracy | 95%+ |
| Avg rating | 3.5+ stars |
| Report response reliability | 95%+ valid report writes |
| Crash-free sessions | 99%+ |
