# Project Brief - Talkd

## Vision

Give people a safe space to talk to a real human, anonymously, right now.

Not a therapist.  
Not AI.  
Not Reddit.  
A stranger who gets it.

---

## What Makes This Different

Talkd combines:

```text
Real-time + Real human + Anonymous
```

The product should feel immediate, private, lightweight, and emotionally safe.

---

## Product Summary

Talkd is an iOS-first anonymous real-time peer-to-peer advice chat app.

A user:
1. Signs in.
2. Chooses a topic.
3. Chooses whether they want to talk or listen.
4. Gets matched with a stranger.
5. Chats for 15 minutes.
6. Leaves with no public identity attached.

The other person is always shown as:

```text
Anonymous
```

---

## Locked Technical Decisions

- Expo 54.0.33 - never upgrade
- React Native inline styles + theme tokens - no NativeWind
- Supabase for auth, database, and realtime
- Supabase Realtime for ephemeral chat relay
- Messages never stored in the database
- All users display as `Anonymous`
- Session duration = 15 minutes / 900 seconds
- Match fallback timeout = 90 seconds
- Current topics:
  - Mental Health
  - Relationships
  - Career & Decisions
  - Late-Night
  - General Advice
  - Anything
- Phone OTP is TODO
- OpenAI moderation must run through a Supabase Edge Function
- OpenAI API keys must never be in the mobile client

---

## Current Priority

Current phase:

```text
Phase 0 - Stabilization and Safety
```

Priority order:

1. Fix dependency/build compatibility.
2. Fix misleading privacy/security copy.
3. Align Supabase schema with app code.
4. Move OpenAI moderation out of the mobile client into a Supabase Edge Function.
5. Fix matchmaking reliability.
6. Fix ratings/reports/safety enforcement.
7. Fix auth verification and onboarding.
8. Continue Phone OTP later.

Do not prioritize new UI polish or extra features before the safety/backend foundation is stable.

---

## Core Product Principles

### 1. Anonymous by default

Users should never see another user's:

- email
- user ID
- real name
- username
- alias
- avatar
- profile metadata

All user-facing peer identity is:

```text
Anonymous
```

### 2. Real-time, not permanent

Chat messages are live and ephemeral.

Allowed to store:
- session metadata
- queue rows
- reports
- ratings
- safety/audit metadata
- push tokens, if implemented securely

Not allowed to store:
- chat message content

### 3. Safety before growth

This app connects strangers around sensitive topics. Safety infrastructure is not optional.

Required:
- moderation before every outbound chat message
- crisis flow
- report + exit always visible
- truthful privacy/security wording
- RLS on user tables
- reliable report writes
- abuse/cooldown enforcement

### 4. Honest copy only

Do not claim:

```text
End-to-end encrypted
No records
Nothing is stored
Permanently deletes account
```

unless those statements are technically true.

Preferred wording:

```text
Real-time anonymous chat
Messages are not saved after the session
Session metadata, reports, and ratings may be stored for safety and quality
```

---

## Conventions

```text
Components:    PascalCase  -> MessageBubble.tsx
Hooks:         camelCase   -> useSession.ts
Routes:        kebab-case  -> role-select.tsx
Constants:     SCREAMING   -> SESSION_DURATION_SECONDS
Theme tokens:  useTheme()  -> t.bg, t.ink, t.line
```

---

## Quality Gates

Before a task is considered done:

```bash
npx.cmd tsc --noEmit
npx.cmd eslint .
```

Both should pass, or failures must be clearly documented.

Additional quality rules:
- TypeScript strict
- `any` forbidden
- Prefer shared hooks/services for reusable business logic
- Keep changes scoped
- Do not rewrite unrelated files
- Do not add dependencies without explaining why
- Errors should be captured by Sentry once Sentry is active

---

## Key Commands

```bash
npx.cmd expo start
npx.cmd expo start --ios
npx.cmd tsc --noEmit
npx.cmd eslint .
npx.cmd supabase db push
npx.cmd supabase gen types typescript --local > types/supabase.ts
```

---

## Documentation Update Rules

- Update `AGENTS.md` when a new phase starts.
- Update `agent_docs/tech_stack.md` if any dependency or locked stack decision changes.
- Update `agent_docs/product_requirements.md` when feature acceptance criteria change.
- Update `agent_docs/testing.md` when a new critical flow is added.
- Update `MEMORY.md` only if the file exists and the project owner wants task history tracked there.

Do not create or rewrite `MEMORY.md` unless explicitly asked.

---

## Launch Readiness Definition

Talkd is not ready for public launch until:

- Install/build is clean.
- TypeScript passes.
- ESLint passes or known issues are documented.
- No OpenAI key exists in the Expo client.
- No false E2EE/no-records copy exists.
- Supabase schema matches app usage.
- RLS protects all user tables.
- Reports and ratings work.
- Matchmaking does not create duplicate matches.
- Chat messages are not stored in DB.
- Crisis flow works.
- Internal TestFlight with at least 10 users is completed.
