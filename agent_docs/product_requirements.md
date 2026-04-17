# Product Requirements — Talkd

## Value Proposition
Talkd = Real-time + Real human + Anonymous
Session length: 15 minutes. Display name: "Anonymous". No aliases.

## User Persona
Alex, 21. Can't open up to people close to him.
1am. Opens Talkd. Picks Relationships. 20 seconds later he's talking to a stranger who gets it.
15 minutes later he feels lighter. That's the product.

---

## F01 — Anonymous Identity
- Auth: Sign in with Apple, Email, or Phone (Supabase Auth)
- Display name: "Anonymous" — no aliases, no custom names
- No PII ever shown to other users

**Acceptance Criteria:**
- [ ] Sign in with Apple works
- [ ] Email signup/login works
- [ ] Phone OTP works
- [ ] All other users see "Anonymous"
- [ ] No PII on any user-facing screen
- [ ] Onboarding: 3 steps (welcome → role → auth)

---

## F02 — Topic-Based Matching
Topics (3 only — do not add more in MVP):
- Mental Health
- Relationships
- General Advice

Matching priority:
1. Same topic + Talker ↔ Listener
2. Same topic + Talker ↔ Talker (fallback)
3. Never: Listener ↔ Listener

**Acceptance Criteria:**
- [ ] Match in < 30s or async fallback triggers
- [ ] Matching screen: shows estimated time if < 60s, else "Finding someone for you..."
- [ ] Correct role pairing

---

## F03 — Role + Intent Selection
- Role: Talker or Listener (resets each session)
- Intent: "Do you want advice, or just to be heard?"
- Listener sees talker's intent during chat

**Acceptance Criteria:**
- [ ] Role screen before every match
- [ ] Intent answer visible to Listener

---

## F04 — Real-Time Chat
- Supabase Realtime broadcast channels
- Messages NOT stored in DB
- Typing indicator
- Text only

**Acceptance Criteria:**
- [ ] Messages < 500ms delivery
- [ ] Zero message rows in DB after session
- [ ] Typing indicator works

---

## F05 — Session Timer (15 min)
- Duration: 900 seconds
- Warning at 2:00
- Auto-close at 0:00
- No extension

**Acceptance Criteria:**
- [ ] Timer visible to both users
- [ ] Warning banner at 2:00
- [ ] Auto-close + messages wiped at 0:00

---

## F05b — Post-Session Rating
- Appears after every session end
- Format: 1-5 stars + label selection
- Labels: "Felt heard", "Great listener", "Helpful advice", "Very supportive", "Awkward", "Left too early", "Not helpful"
- Fully anonymous (no user_id stored)
- Skip button available

**Acceptance Criteria:**
- [ ] Rating screen after every session
- [ ] Stars + labels save to DB without user_id
- [ ] Skip works

---

## F06 — Async Fallback
- Triggers at 30s with no match
- User types message (max 500 chars)
- Push notification when someone responds
- Expires after 24 hours

**Acceptance Criteria:**
- [ ] Fallback at exactly 30s
- [ ] Push on response
- [ ] 24h expiry

---

## F07 — Crisis Detection & Moderation
- OpenAI Moderation API on every outbound message
- Crisis = self-harm / self-harm/intent / self-harm/instructions

Crisis flow:
1. Input disabled
2. Crisis popup appears — 5-second lock
3. Shows 988 + Crisis Text Line + findahelpline.com
4. Listener sees guidance phrases

**Acceptance Criteria:**
- [ ] Every message moderated before send
- [ ] Popup can't dismiss for 5s
- [ ] Both users see context
- [ ] Only session ID flagged (no message content)

---

## F08 — Report & Exit
- Report + Exit always visible in chat header
- Exit in ≤ 2 taps
- 24h ban after 3 reports
- Reporter never re-matched with reported user

**Acceptance Criteria:**
- [ ] Buttons always visible, never hidden
- [ ] Exit ≤ 2 taps
- [ ] Ban triggers at 3 reports

---

## F09 — Push Notifications
- Re-engagement push after 48h inactivity
- Push when async message receives a response

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
- Session extension
- More than 3 topics
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
