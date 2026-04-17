# Talkd — Product Requirements Document (PRD)
**Version:** 1.1 | **Status:** Final | **Platform:** iOS (React Native Expo 54.0.33) | **Date:** April 2026

---

## 1. Product Overview

| Field | Value |
|---|---|
| App Name | Talkd |
| Tagline | The right person, right now, no judgment. |
| Platform | iOS — React Native Expo 54.0.33 (Android in Phase 2) |
| Language | English only (Turkish in Phase 2) |
| MVP Goal | 100 active users, avg 3+ conversations/user in first 30 days |
| Target Launch | 8–10 weeks from development start |
| Theme | System default (follows iPhone light/dark setting) |

---

## 2. The Problem

| Option | Why It Fails |
|---|---|
| Close friends | Judgment, lack of understanding |
| Reddit | Async — reply may never come |
| AI (ChatGPT) | Feels cold, not a real person |
| 7 Cups | Formal, professional, not peer-to-peer |
| Connected2.me | No purpose, full of bots |

**Talkd's unique position:** Real-time + Real human + Anonymous — no other app delivers all three.

---

## 3. Target Users

### Primary Persona: Alex
- Age: 18–28, university student or young adult
- Problem: Can't talk to people close to them about what they're going through
- Device: iPhone (iOS 16+)
- Motivation: To be heard without being judged

---

## 4. User Flows

### 4.1 Onboarding (First Launch — 3 Steps)
```
Step 1: Welcome screen → "What do you need right now?"
Step 2: Select role → [I need to talk] or [I want to listen]
Step 3: Auth → Sign in with Apple / Email / Phone
→ Notification permission prompt
→ Land on Home Screen
→ Display name: "Anonymous" (no alias, no custom name)
```

### 4.2 Core Conversation Flow
```
Home Screen
  → Select topic (Mental Health / Relationships / General Advice)
  → Answer: "Do you want advice, or just to be heard?"
  → Matching begins
      ├── Match found within 30s → Session screen (15 min timer)
      │     → Chat in real-time
      │     → Session ends → 1-5 star rating screen + label selection
      └── No match in 30s → Async Fallback screen
            → User types message, leaves it
            → Push notification when someone responds
```

### 4.3 Screen List (MVP — 9 Screens)
1. Onboarding (3 steps)
2. Home / Category Selection
3. Role Selection (Talker / Listener)
4. Matching / Waiting Screen (estimated wait time if < 60s)
5. Chat Screen
6. Post-Session Rating Screen (1-5 stars + labels)
7. Async Fallback Screen
8. Crisis Popup (auto-triggered)
9. Settings (minimal)

---

## 5. Features

### 5.1 P0 — Must Have (Launch Blockers)

#### F01 — Anonymous Identity
- User signs up via: Sign in with Apple, Email, or Phone number
- Display name shown to others: "Anonymous" (no alias, no custom name)
- Real identity never exposed to other users
- Supabase Auth handles all auth methods

**Acceptance Criteria:**
- [ ] User can sign up with Apple, email, or phone
- [ ] All other users see them as "Anonymous"
- [ ] No PII visible on any user-facing screen

---

#### F02 — Topic-Based Matching
**MVP Topics (3 only):**
- Mental Health
- Relationships
- General Advice

**Matching Priority:**
1. Same topic + Talker ↔ Listener (ideal)
2. Same topic + Talker ↔ Talker (fallback)
3. Never: Listener ↔ Listener

**Acceptance Criteria:**
- [ ] Match occurs within 30 seconds or async fallback triggers
- [ ] Talker never matched with Listener if same-role only option
- [ ] Matching screen shows estimated wait time if < 60s, else "Finding someone for you..."

---

#### F03 — Talker / Listener Role Selection
- Role selected before each session
- Pre-match question: "Do you want advice, or just to be heard?"
- Listener sees talker's answer during chat

**Acceptance Criteria:**
- [ ] Role selection before every match
- [ ] Intent answer visible to matched Listener

---

#### F04 — Real-Time Anonymous Chat
- Supabase Realtime for message relay
- Messages NOT stored after session ends
- Typing indicator
- Text only (no media)

**Acceptance Criteria:**
- [ ] Messages delivered < 500ms
- [ ] No message content in database after session ends
- [ ] Typing indicator works

---

#### F05 — Session-Based Chat (15 min)
- Default session: 15 minutes (900 seconds)
- Timer visible to both users
- Warning at 2:00 remaining
- Auto-closes at 0:00

**Acceptance Criteria:**
- [ ] Timer visible throughout
- [ ] Warning at 2:00
- [ ] Session closes at 0:00, messages wiped

---

#### F05b — Post-Session Rating
- After every session ends, rating screen appears
- Format: 1-5 stars
- Labels to choose (examples: "Felt heard", "Great listener", "Helpful advice", "Awkward", "Left too early")
- Rating stored in DB (linked to session, not to specific user — anonymous)

**Acceptance Criteria:**
- [ ] Rating screen appears after every session end
- [ ] 1-5 stars + at least 4 label options
- [ ] Rating saved without identifying the rated user

---

#### F06 — Async Fallback
- Triggers after 30s with no match
- User leaves a message (max 500 chars)
- Push notification sent when someone responds
- Messages expire after 24 hours

**Acceptance Criteria:**
- [ ] Fallback screen at exactly 30s
- [ ] Push notification on response
- [ ] 24-hour expiry enforced

---

#### F07 — AI Crisis Detection & Moderation
- OpenAI Moderation API on every outbound message
- Crisis triggers: self-harm, self-harm/intent, self-harm/instructions

**Crisis Flow:**
```
Message flagged
  → Input disabled
  → Crisis popup (cannot dismiss for 5 seconds)
  → Shows: 988 Lifeline + Crisis Text Line + findahelpline.com
  → Matched user sees listener guidance phrases
```

**Acceptance Criteria:**
- [ ] Every message moderated before delivery
- [ ] Popup cannot dismiss for 5s
- [ ] Both users receive context
- [ ] Session flagged by ID only (no message content logged)

---

#### F08 — Report & Exit
- Report + Exit always visible in chat header
- Single-tap exit
- 24-hour ban after 3 reports
- Reporter never re-matched with reported user

**Acceptance Criteria:**
- [ ] Buttons always visible, never hidden
- [ ] Exit in ≤ 2 taps
- [ ] Ban triggers at 3 reports

---

#### F09 — Re-engagement Push Notifications
- Notify inactive users to come back
- Notify users when async message gets a response

**Acceptance Criteria:**
- [ ] Push sent when async message receives a reply
- [ ] Re-engagement push for users inactive 48+ hours

---

### 5.2 NOT in MVP
- Profile photos
- Friend/follow system
- Group conversations
- Media sharing
- Web version
- In-app payments
- Voice/video calls
- Session extension
- More than 3 topic categories
- Turkish localization
- Android support
- Premium features (Phase 2)

---

## 6. Success Metrics (First 30 Days)

| Metric | Target |
|---|---|
| Active users | 100 |
| Conversations per user | 3+ |
| Match success rate | 70%+ |
| Session completion rate | 60%+ |
| Week 2 retention | 30%+ |
| Crisis popup accuracy | 95%+ |
| Avg post-session rating | 3.5+ stars |

---

## 7. Phase 2 Preview (Not Now)
- Freemium monetization (instant matching, topic priority, premium listener filter)
- Android support
- Turkish localization
- Expanded topic categories
- Soft reputation badges (Good Listener, Supportive, Calm)
- Voice call option
