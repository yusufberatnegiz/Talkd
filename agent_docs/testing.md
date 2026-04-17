# Testing Strategy — Talkd

## Pre-Commit Hooks (Run Before Every Commit)
```bash
npm install -D husky
npx husky init

# .husky/pre-commit
npx tsc --noEmit
npx eslint . --ext .ts,.tsx
```
Both must pass. Never bypass.

---

## Critical Manual Tests

### After F01 (Auth):
- [ ] Sign in with Apple → onboarding → Home screen
- [ ] Email signup → verify → Home screen
- [ ] Phone OTP → Home screen
- [ ] Other users see "Anonymous" — not email or name
- [ ] Network inspector: confirm no PII in any request

### After F02/F03 (Matching):
- [ ] Two simulators, same topic → match within 30s
- [ ] Wait 30s → async fallback screen appears
- [ ] Matching screen: shows estimate if < 60s, generic message otherwise
- [ ] Talker + Listener → correct roles assigned

### After F04 (Chat):
- [ ] Message appears on other device < 500ms
- [ ] Typing indicator shows on other device
- [ ] Kill app mid-session → graceful reconnect or error
- [ ] After session ends: confirm zero message rows in DB

### After F05 (Timer):
- [ ] Timer counts from 15:00
- [ ] Warning banner at 2:00
- [ ] Auto-closes at 0:00
- [ ] matchStore.messages is empty after navigation

### After F05b (Rating):
- [ ] Rating screen appears after session end
- [ ] Stars tap correctly
- [ ] Labels multi-select works
- [ ] Row saved in session_ratings without user_id
- [ ] Skip navigates to home

### After F06 (Async Fallback):
- [ ] Fallback at exactly 30s
- [ ] Submit message → push notification on listener device
- [ ] Mock 24h → message deleted from DB

### After F07 (Crisis):
- [ ] "I want to hurt myself" → popup appears
- [ ] "I feel sad today" → chat continues
- [ ] Popup cannot be dismissed for 5s
- [ ] 988 button opens phone dialer
- [ ] Listener sees guidance phrases
- [ ] DB: session flagged, no message content stored

### After F08 (Report/Exit):
- [ ] Report button visible at all times during chat
- [ ] Exit in ≤ 2 taps
- [ ] Report submits silently
- [ ] After 3 reports: user banned

### After F09 (Push):
- [ ] Push received on physical device for async reply
- [ ] Re-engagement push after 48h (test with mock timestamp)

---

## Moderation Unit Tests
```typescript
// Only required unit tests for MVP
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
npx tsc --noEmit            # Must show zero errors
grep -r ": any" src/        # Must return nothing
grep -r "as any" src/       # Must return nothing
```

---

## TestFlight Beta (10 users before App Store)
Ask beta users to:
1. Sign in with Apple
2. Match with someone (coordinate timing)
3. Have a 5-min conversation
4. Try the report flow (test account)
5. Let the 30s timeout trigger

Collect feedback on: match speed, timer feel, crashes, crisis popup clarity.
