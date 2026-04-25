# Testing Strategy - Talkd

## Pre-Commit Checks

On this Windows workspace, use `npx.cmd` to avoid PowerShell execution-policy issues:

```bash
npx.cmd tsc --noEmit
npx.cmd eslint .
```

Both must pass. Never bypass.

---

## Critical Manual Tests

### After F01 (Auth)
- [ ] Sign in with Apple -> Home screen
- [ ] Email signup/signin -> Home screen
- [ ] Phone OTP -> Home screen (TODO)
- [ ] Other users see "Anonymous" - not email or name
- [ ] Network inspector: confirm no PII in user-facing realtime payloads

### After F02/F03 (Matching)
- [ ] Two simulators, same topic -> match using realtime queue
- [ ] Wait 90s -> async fallback screen appears
- [ ] Matching screen shows wait state
- [ ] Talker + Listener -> correct roles assigned
- [ ] Talker + Talker fallback works when selected

### After F04 (Chat)
- [ ] Message appears on other device
- [ ] Typing indicator shows on other device
- [ ] Kill app mid-session -> graceful reconnect or error
- [ ] After session ends: confirm messages are wiped from local state
- [ ] Confirm there is no message insert code path

### After F05 (Timer)
- [ ] Timer counts from 15:00
- [ ] Warning state at 2:00
- [ ] Session end wipes messages

### After F05b (Rating)
- [ ] Rating screen appears after session end
- [ ] Stars tap correctly
- [ ] Badge/label selection works
- [ ] Skip/close works

### After F06 (Async Fallback)
- [ ] Fallback at 90s
- [ ] Submit async note
- [ ] Push notification on response (TODO)
- [ ] 24h expiry when async persistence is implemented

### After F07 (Crisis)
- [ ] "I want to hurt myself" -> popup appears
- [ ] "I feel sad today" -> chat continues
- [ ] Popup cannot be dismissed for 5s
- [ ] Crisis resources are visible

### After F08 (Report/Exit)
- [ ] Report button visible at all times during chat
- [ ] Exit in <= 2 taps
- [ ] Report submits from chat UI

### After F09 (Push)
- [ ] Push received on physical device for async reply
- [ ] Re-engagement push after 48h

---

## Moderation Unit Tests

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
});
```

---

## TypeScript Check

```bash
npx.cmd tsc --noEmit
rg ": any|as any"
```

The `any` search should return no real TypeScript usages.

---

## TestFlight Beta (10 users before App Store)
Ask beta users to:

1. Sign in with Apple.
2. Match with someone.
3. Have a conversation.
4. Try the report flow with a test account.
5. Let the 90s timeout trigger.

Collect feedback on match speed, timer feel, crashes, and crisis popup clarity.
