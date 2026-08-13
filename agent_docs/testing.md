# Testing Strategy - Talkd

## Pre-Commit Checks

On this Windows workspace, use `npx.cmd` to avoid PowerShell execution-policy issues:

```bash
npx.cmd tsc --noEmit
npx.cmd eslint .
```

Both must pass. Never bypass. If a check fails due to an existing unrelated issue, document it clearly.

---

## Static Safety Checks

Run before TestFlight and after security-sensitive changes.

```bash
rg "EXPO_PUBLIC_OPENAI_API_KEY|dangerouslyAllowBrowser|new OpenAI|service_role|SERVICE_ROLE"
rg "end-to-end encrypted|E2E encrypted|no records|nothing is stored|permanently deletes"
rg ": any|as any"
```

Expected:
- No OpenAI client in Expo app code.
- No OpenAI API key in public Expo env variables.
- No service role key in client code.
- No false E2EE/no-records/delete-account claims.
- No real `any` usage.

---

## Security / Privacy Manual Checks

- [ ] No `EXPO_PUBLIC_OPENAI_API_KEY`
- [ ] No `dangerouslyAllowBrowser`
- [ ] No OpenAI client directly inside Expo app code
- [ ] OpenAI moderation called through Supabase Edge Function
- [ ] No service-role key in client code
- [ ] No “end-to-end encrypted” copy unless real E2EE exists
- [ ] No “no records” copy if metadata/reports/ratings are stored
- [ ] Account deletion copy is truthful
- [ ] Chat messages are not inserted into DB
- [ ] Session metadata, reports, ratings wording is clear
- [ ] Supabase RLS enabled on all user-accessed tables
- [ ] Reports can only be submitted by session participants
- [ ] Ratings can only be submitted by session participants
- [ ] Duplicate reports prevented
- [ ] Duplicate ratings prevented
- [ ] Users cannot directly update `report_count`
- [ ] Users cannot directly update `ban_expires_at`

---

## Critical Manual Tests

### After F01 - Auth

- [ ] Sign in with Apple -> Home screen
- [ ] Email signup/signin -> Home screen
- [ ] Email verification required flow -> Check Email state
- [ ] Invalid credentials -> friendly error
- [ ] Weak password -> friendly error
- [ ] Apple canceled login -> no scary error
- [ ] Apple missing identity token -> handled safely
- [ ] Phone OTP -> Home screen (TODO)
- [ ] Other users see `Anonymous`, not email or name
- [ ] Network inspector: confirm no PII in user-facing realtime payloads
- [ ] Profile row is created on first sign-in

---

### After Onboarding

- [ ] New user sees onboarding before first match
- [ ] Safety guidelines are shown
- [ ] User must accept before first match
- [ ] Acceptance timestamp stored if schema supports it
- [ ] Mental Health topic shows extra safety guidance
- [ ] Returning accepted user does not see onboarding repeatedly

---

### After F02/F03 - Matching

- [ ] Two simulators, same topic -> match
- [ ] Talker + Listener -> correct roles assigned
- [ ] Talker + Talker fallback works when selected/allowed
- [ ] Listener + Listener never matches
- [ ] Wait 90s -> no-match fallback screen appears
- [ ] Matching screen shows wait state
- [ ] Cancel/back removes queue entry
- [ ] User cannot match with self
- [ ] Duplicate taps do not create duplicate queue rows
- [ ] Three simulators do not create duplicate matches
- [ ] If one user backgrounds app, queue/session state is handled safely
- [ ] Banned/cooldown user cannot enter queue

---

### After F04 - Chat

- [ ] Message appears on other device
- [ ] Typing indicator shows on other device
- [ ] Message is moderated before broadcast
- [ ] Unsafe message does not send
- [ ] Crisis message opens crisis popup
- [ ] Moderation/network failure does not erase draft
- [ ] Realtime send failure does not erase draft
- [ ] Duplicate rapid taps do not send duplicate messages
- [ ] Peer disconnect handled gracefully
- [ ] Kill app mid-session -> graceful reconnect or error
- [ ] After session ends: confirm messages are wiped from local state
- [ ] Confirm there is no message insert code path

---

### After F05 - Timer

- [ ] Timer counts from 15:00
- [ ] Warning state at 2:00
- [ ] Session end wipes messages
- [ ] Timer end does not duplicate navigation
- [ ] Manual exit does not conflict with timer
- [ ] Session metadata marks session ended if implemented

---

### After F05b - Rating

- [ ] Rating screen appears after session end
- [ ] Stars tap correctly
- [ ] Badge/label selection works
- [ ] Skip/close works
- [ ] Rating insert succeeds
- [ ] Duplicate rating from same rater/session is prevented
- [ ] Private note is not exposed publicly
- [ ] Other user cannot see who rated them
- [ ] Aggregated rating stats work if implemented

---

### After F06 - No-Match Fallback

- [ ] Fallback at 90s
- [ ] Keep looking starts a fresh match attempt
- [ ] Go home removes the queue row and returns home
- [ ] Screen clearly says nothing was sent or saved
- [ ] No async note controls appear until persistence is implemented

---

### After F07 - Crisis

- [ ] “I want to hurt myself” -> popup appears
- [ ] “I feel sad today” -> chat continues
- [ ] Popup cannot be dismissed for 5s
- [ ] Crisis resources are visible
- [ ] User-friendly copy makes clear Talkd is not emergency support
- [ ] Mental Health topic has extra guidance
- [ ] Crisis popup does not crash if moderation response is malformed

---

### After F08 - Report/Exit

- [ ] Report button visible at all times during chat
- [ ] Exit button visible at all times during chat
- [ ] Exit in <= 2 taps
- [ ] Report submits from chat UI
- [ ] Report is tied to current session
- [ ] Reporter is current user
- [ ] Reported user is the other participant
- [ ] Duplicate report from same reporter/session is prevented
- [ ] Report failure shows user-friendly message
- [ ] Reported user cooldown/ban logic works if threshold reached

---

### After F09 - Push

- [ ] Push permission request appears at appropriate time
- [ ] Push token stored for current user
- [ ] Push received on physical device for async reply
- [ ] Re-engagement push after 48h
- [ ] Push notification does not expose sensitive chat content
- [ ] User can disable notifications at OS level without app crash

---

## Moderation Tests

When moderation is implemented through an Edge Function, tests should mock the Edge Function response.

```typescript
describe('moderateMessage', () => {
  it('safe message passes', async () => {
    const result = await moderateMessage('I feel anxious today');

    expect(result.isSafe).toBe(true);
    expect(result.isCrisis).toBe(false);
  });

  it('self-harm content triggers crisis', async () => {
    const result = await moderateMessage('I want to hurt myself');

    expect(result.isCrisis).toBe(true);
  });

  it('moderation failure does not send message', async () => {
    await expect(moderateMessage('hello')).rejects.toThrow();
  });
});
```

---

## Supabase Schema Tests / Checks

Before pushing to production Supabase:

- [ ] Every `supabase.from(...)` table exists in migrations
- [ ] Every `supabase.rpc(...)` function exists in migrations
- [ ] Every view queried by the app exists
- [ ] RLS is enabled on all user-accessed tables
- [ ] Policies are scoped to `auth.uid()`
- [ ] Session participant checks exist for reports/ratings
- [ ] Client cannot insert arbitrary reports for unrelated users
- [ ] Client cannot rate unrelated users
- [ ] Client cannot directly modify safety counters
- [ ] Chat message content table does not exist unless explicitly approved, which should not happen for MVP

Useful search:

```bash
rg "supabase\.from|supabase\.rpc"
```

---

## TypeScript Check

```bash
npx.cmd tsc --noEmit
rg ": any|as any"
```

The `any` search should return no real TypeScript usages.

---

## TestFlight Beta - 10 Users Before App Store

Ask beta users to:

1. Sign in with Apple.
2. Sign in with Email.
3. Complete onboarding.
4. Match with someone.
5. Have a conversation.
6. Try the report flow with a test account.
7. Let the 90s timeout trigger.
8. Complete a rating.
9. Force close/reopen during matching and chat.
10. Test crisis popup wording with safe test phrases.

Collect feedback on:

- match speed
- timer feel
- trust/safety wording
- crashes
- message send failures
- crisis popup clarity
- report flow clarity
- whether users understand what is anonymous and what is stored
