# Product Requirements - Talkd

## Value Proposition
Talkd = Real-time + Real human + Anonymous.

Session length: 15 minutes. Display name: "Anonymous". No aliases.

---

## User Persona
Alex, 21, cannot open up to people close to him.
At 1am he opens Talkd, picks a topic, and quickly talks to a stranger who gets it.
After the conversation, he feels lighter.

---

## F01 - Anonymous Identity
- Auth: Apple and Email are implemented.
- Auth: Phone OTP is TODO.
- Display name: "Anonymous" - no aliases, no custom names.
- No PII ever shown to other users.

**Acceptance Criteria:**
- [x] Sign in with Apple works
- [x] Email signup/login works
- [ ] Phone OTP works
- [x] All other users see anonymous identity language
- [ ] No PII on any user-facing screen
- [ ] Onboarding: 3 steps

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

**Acceptance Criteria:**
- [x] Current 6-topic UI exists
- [x] Match via Supabase Realtime broadcast channels
- [x] 90s async fallback triggers
- [x] Matching screen shows wait state
- [x] Correct role pairing for Talker/Listener flow

---

## F03 - Role + Intent Selection
- Talker chooses a topic and intent.
- Listener can go on duty and filter by topic.
- Intent/context can be shown during chat.

**Acceptance Criteria:**
- [x] Intent screen before match
- [x] Listener duty screen
- [x] Context note visible in chat

---

## F04 - Real-Time Chat
- Supabase Realtime broadcast channels.
- Messages NOT stored in DB.
- Typing indicator.
- Text only.

**Acceptance Criteria:**
- [x] Messages broadcast over realtime channel
- [x] No message insert code exists
- [x] Typing indicator exists

---

## F05 - Session Timer (15 min)
- Duration: 900 seconds.
- Warning at 2:00.
- Uses `SESSION_DURATION_SECONDS`.

**Acceptance Criteria:**
- [x] Timer visible to both users
- [x] Warning state at 2:00
- [x] Messages wiped when session ends

---

## F05b - Post-Session Rating
- Appears after session end.
- Format: 1-5 stars + label/badge selection.
- Skip is available by submitting without a star/badge.

**Acceptance Criteria:**
- [x] Rating screen after session end
- [x] Stars and badges work
- [x] Skip/close path works

---

## F06 - Async Fallback
- Triggers after the current 90s match timeout.
- User can leave an async note.
- Push notification on response is TODO.
- Expiry is 24 hours when async persistence is implemented.

**Acceptance Criteria:**
- [x] Fallback at 90s
- [x] Async note UI exists
- [ ] Push on response
- [ ] 24h expiry

---

## F07 - Crisis Detection & Moderation
- OpenAI Moderation API on every outbound chat message.
- Crisis = self-harm / self-harm intent / self-harm instructions.

Crisis flow:
1. Crisis popup appears.
2. Dismiss action is locked for 5 seconds.
3. Shows hotline/resource guidance.

**Acceptance Criteria:**
- [x] Every chat message is moderated before send
- [x] Popup cannot dismiss for 5s
- [x] Crisis resources are shown

---

## F08 - Report & Exit
- Report + Exit always visible in chat header.
- Exit in <= 2 taps.

**Acceptance Criteria:**
- [x] Buttons always visible
- [x] Exit in <= 2 taps
- [x] Report submits from chat UI

---

## F09 - Push Notifications
- Re-engagement push after 48h inactivity.
- Push when async message receives a response.

**Acceptance Criteria:**
- [ ] Re-engagement push after 48h
- [ ] Async reply push works on physical device

---

## NOT in MVP
- Profile photos
- Friend/follow system
- Group chat
- Media sharing
- Web version
- Payments / subscriptions
- Voice/video
- More topics unless explicitly requested
- Turkish
- Android
- Premium features

---

## Success Metrics (30 days)

| Metric | Target |
|---|---|
| Active users | 100 |
| Conversations/user | 3+ |
| Match success rate | 70%+ |
| Session completion | 60%+ |
| Week 2 retention | 30%+ |
| Crisis accuracy | 95%+ |
| Avg rating | 3.5+ stars |
