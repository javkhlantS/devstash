# Auth Security Review

**Last Audit Date:** 2026-03-20
**Auditor:** auth-auditor agent
**Scope:** All authentication-related code in the devstash Next.js project

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 2 |
| Medium   | 3 |
| Low      | 2 |

---

## Findings

### [HIGH] No Rate Limiting on Any Auth Endpoint

**File:** `app/api/auth/register/route.ts`, `app/api/auth/forgot-password/route.ts`, `app/api/auth/reset-password/route.ts`, `app/api/auth/change-password/route.ts`
**Area:** Rate Limiting
**Issue:** None of the auth API routes apply any rate limiting. There is no IP-based throttle, token bucket, or sliding window check on any of the four sensitive endpoints. The NextAuth credentials `authorize` callback in `auth.ts` (lines 41–57) is also invoked on every sign-in attempt with no throttling.
**Impact:** An attacker can brute-force passwords against the sign-in flow at network speed. The forgot-password endpoint (`app/api/auth/forgot-password/route.ts`) can be abused to flood any email address with reset emails (email bombing). The register endpoint can be used to mass-create accounts. The change-password endpoint can be brute-forced against an authenticated user's current password if a session token is stolen.
**Fix:** Add rate limiting using a library such as `@upstash/ratelimit` (with Redis) or `next-rate-limit`. Apply limits at the route level before business logic executes. Recommended limits:

```typescript
// Example for forgot-password — 5 requests per 15 minutes per IP
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  // ... rest of handler
}
```

Apply stricter limits on sign-in (e.g., 10 attempts per 15 minutes per IP) and looser limits on registration (e.g., 5 per hour per IP).

---

### [HIGH] Password Reset and Verification Tokens Stored as Plaintext

**File:** `lib/tokens.ts` (lines 14, 49)
**Area:** Token Security
**Issue:** Both `generateVerificationToken` and `generatePasswordResetToken` store the raw UUID token value directly in the `VerificationToken.token` column (lines 14–22 and 49–58). The `validateVerificationToken` and `validatePasswordResetToken` functions then look up tokens with `findUnique({ where: { token } })` — a direct equality query on the plaintext value. If the database is ever read by an unauthorized party (SQL injection, a compromised DB credential, a backup leak, or a rogue insider), every active reset and verification token is immediately usable to take over any account that has a pending reset.
**Impact:** A database read — even read-only — grants an attacker the ability to complete password resets and email verifications for every user who has an active token. For password resets this is a full account takeover primitive.
**Fix:** Store a SHA-256 hash of the token in the database. Send the raw token to the user in the email. On validation, hash the incoming token and compare against the stored hash.

```typescript
import { createHash, randomBytes } from "crypto";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function generatePasswordResetToken(email: string) {
  const identifier = `${RESET_TOKEN_PREFIX}${email}`;
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  // 32 bytes = 256 bits of entropy; hex-encode for URL safety
  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);
  const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { identifier, token: hashedToken, expires },
  });

  return rawToken; // send this in the email URL
}

export async function validatePasswordResetToken(rawToken: string) {
  const hashedToken = hashToken(rawToken);
  const record = await prisma.verificationToken.findUnique({
    where: { token: hashedToken },
  });
  // ... rest of validation
}
```

Note: switching to `randomBytes(32).toString("hex")` also replaces `randomUUID()`. While `crypto.randomUUID()` is a CSPRNG and its 122 bits of entropy is technically sufficient, OWASP recommends at least 128 bits for reset tokens and a URL-safe encoding that doesn't carry the fixed-position UUID version/variant bits. `randomBytes(32)` makes this explicit.

---

### [MEDIUM] Account Deletion Requires No Password Confirmation

**File:** `app/api/auth/delete-account/route.ts` (lines 5–16), `app/dashboard/profile/DeleteAccountButton.tsx` (lines 24–39)
**Area:** Profile/Account
**Issue:** The DELETE endpoint (`delete-account/route.ts`) verifies session existence (line 8) but does not require the user to re-authenticate or provide their current password before destroying the account. The UI (`DeleteAccountButton.tsx`) asks the user to type "delete my account" (line 82), but this string check happens only in client-side JavaScript — it is trivially bypassed by sending a DELETE request directly to `/api/auth/delete-account`. The API route itself at lines 10–15 performs no password verification at all.
**Impact:** Any attacker who obtains a valid session cookie (e.g., via XSS, session fixation on a shared device, or a stolen JWT) can immediately delete the victim's account and all data without knowing the password. This is also a CSRF-adjacent risk for credential accounts.
**Fix:** Require the current password in the DELETE request body for credential-based users and verify it server-side before deletion.

```typescript
// delete-account/route.ts
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { password } = body;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  // For credential users, require password confirmation
  if (user?.password) {
    if (!password) {
      return NextResponse.json(
        { error: "Password is required to delete your account" },
        { status: 400 }
      );
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 403 }
      );
    }
  }

  await prisma.user.delete({ where: { id: session.user.id } });
  return NextResponse.json({ success: true });
}
```

---

### [MEDIUM] Registration Leaks Whether an Email Is Already Registered

**File:** `app/api/auth/register/route.ts` (lines 25–31)
**Area:** Registration
**Issue:** When a duplicate email is submitted, the endpoint returns HTTP 409 with the body `{ "error": "User already exists" }`. This allows an unauthenticated attacker to enumerate valid email addresses by registering with candidate emails and observing the response code and message.
**Impact:** An attacker can silently build a list of which email addresses have accounts. This list can be used for phishing, credential stuffing target lists, or social engineering. This is a lower-severity enumeration issue, but it is a real information disclosure.
**Fix:** Return the same HTTP 200/201 response and generic message regardless of whether the email already exists. If email verification is enabled, simply state "If this email is not already registered, a verification link has been sent." If verification is disabled, avoid confirming account creation in a way that distinguishes existing from new addresses. At minimum, change the status from 409 to 200 and use a generic message.

---

### [MEDIUM] Weak Minimum Password Length (6 Characters)

**File:** `app/api/auth/register/route.ts` (no explicit minimum enforced), `app/api/auth/reset-password/route.ts` (line 17), `app/api/auth/change-password/route.ts` (line 22)
**Area:** Registration / Password Reset / Profile/Account
**Issue:** The reset-password and change-password routes enforce a minimum password length of 6 characters. The register route enforces no minimum at all beyond the `required` HTML attribute (which is bypassable via direct API calls). Six characters is below the NIST SP 800-63B minimum of 8 characters for user-chosen passwords, and well below OWASP's recommendation of at least 8 characters with encouragement toward longer passphrases.
**Impact:** Users can set passwords that are trivially brute-forced offline if a hashed password is ever exposed. A 6-character lowercase password has approximately 26^6 = 308 million combinations — bcrypt at cost factor 10 provides meaningful resistance, but the effective keyspace is significantly smaller than modern recommendations.
**Fix:** Enforce a minimum of 8 characters consistently across all three endpoints and in the registration route, and add the same validation to the register route which currently has none server-side:

```typescript
// In register/route.ts, after the confirmPassword check:
if (password.length < 8) {
  return NextResponse.json(
    { error: "Password must be at least 8 characters" },
    { status: 400 }
  );
}
```

Change `< 6` to `< 8` in `reset-password/route.ts` line 17 and `change-password/route.ts` line 22.

---

### [LOW] Proxy Middleware Does Not Protect API Routes

**File:** `proxy.ts` (lines 14–16)
**Area:** Session Config
**Issue:** The `config.matcher` in `proxy.ts` explicitly excludes all `/api` paths:

```typescript
matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
```

This means the middleware authentication guard does not run on any API route. While `change-password` and `delete-account` call `auth()` internally and return 401 if unauthenticated, this is currently a pattern that must be remembered and manually applied to every future authenticated API route. Any new API route that omits the `auth()` check will be silently unprotected with no middleware safety net.
**Impact:** Not a current vulnerability because the existing protected routes (`change-password`, `delete-account`) do call `auth()` themselves. However, it is one missed `auth()` call away from an unauthenticated access issue on any future route.
**Fix:** Extend the matcher to also protect `/api/auth/change-password`, `/api/auth/delete-account`, and any future authenticated API routes, or apply a blanket API protection pattern. Alternatively, create a shared `requireAuth` helper that wraps route handlers and document that it is mandatory for all mutating auth routes.

---

### [LOW] Email Verification Token Not Invalidated on Re-Registration Attempt

**File:** `lib/tokens.ts` (lines 9–11)
**Area:** Email Verification
**Issue:** `generateVerificationToken` deletes all existing tokens for an email before creating a new one (`deleteMany({ where: { identifier: email } })`). This is a deliberate and correct design for preventing stale token accumulation. However, the register endpoint (`register/route.ts` lines 25–31) returns 409 and exits early if a user already exists, meaning a second registration attempt for an existing-but-unverified user cannot re-trigger a verification email. The user is stuck with "User already exists" and no way to resend the verification link from the UI.

This is a low-severity UX-security issue: an unverified user who lost their email cannot easily recover without manual intervention. More importantly, if the first email was never received and the account exists in a permanently unverifiable state, the legitimate user is locked out of their own email address on this platform.
**Impact:** Unverified users who lose access to their initial verification email have no self-service path to resend it. This is not an attacker-exploitable vulnerability, but it degrades security by creating ghost accounts that block legitimate registration.
**Fix:** Add a resend-verification endpoint (e.g., `/api/auth/resend-verification`) that accepts an email, confirms the user exists and is unverified, generates a new token (the existing `generateVerificationToken` handles cleanup correctly), and sends a fresh email. Rate-limit this endpoint.

---

## Passed Checks

- **bcrypt used with cost factor 10** — All password hashing calls use `bcrypt.hash(password, 10)`, which is the recommended minimum. Found in `app/api/auth/register/route.ts:33`, `app/api/auth/reset-password/route.ts:40`, `app/api/auth/change-password/route.ts:49`. (`bcrypt.compare` performs constant-time comparison automatically.)

- **Passwords never logged or returned in API responses** — No `console.log` of password variables anywhere in auth code. The register response (`register/route.ts:52–58`) returns only `id`, `name`, and `email`. The `getUserProfile` function (`lib/db/users.ts:36–43`) maps `!!user.password` to a boolean `hasPassword` and never returns the hash.

- **Password hashed before database write** — All three write paths (register, reset-password, change-password) call `bcrypt.hash` before the Prisma `create`/`update` call. No code path writes a plaintext password.

- **Current password verified before change** — `change-password/route.ts:41–46` fetches the stored hash and calls `bcrypt.compare(currentPassword, user.password)` before allowing the update.

- **Session validated on all protected API routes** — Both `change-password/route.ts:7–10` and `delete-account/route.ts:6–9` call `await auth()` and return 401 if `session?.user?.id` is falsy. The profile page (`app/dashboard/profile/page.tsx:38–39`) also guards with `auth()` and `redirect("/sign-in")`.

- **IDOR prevented on profile endpoints** — All DB operations on the protected routes use `session.user.id` (from the verified JWT) as the `where` clause, never a user-supplied ID. A user cannot target another user's data.

- **No email enumeration in forgot-password** — `forgot-password/route.ts:17–25` always returns `{ success: true }` regardless of whether the email exists. The conditional email send is server-side only.

- **Password reset tokens are single-use** — `reset-password/route.ts:42–50` wraps the password update and token deletion in a `prisma.$transaction`, ensuring the token is atomically consumed. The token cannot be replayed.

- **Email verification tokens are single-use** — `verify-email/page.tsx:36–44` uses the same atomic transaction pattern (`prisma.$transaction`) to mark email verified and delete the token simultaneously.

- **Reset token expiry is appropriate** — Verification tokens expire in 24 hours (`lib/tokens.ts:4`), password reset tokens in 1 hour (`lib/tokens.ts:5`). Both are within OWASP-recommended bounds.

- **Password reset token scoped by prefix** — `validatePasswordResetToken` (`lib/tokens.ts:71`) checks `record.identifier.startsWith(RESET_TOKEN_PREFIX)` before accepting a token, preventing verification tokens from being used as password reset tokens and vice versa.

- **Middleware guards the entire dashboard** — `proxy.ts:6–11` redirects all unauthenticated requests to `/sign-in` for any path under `/dashboard`. The `callbackUrl` is restricted to same-origin by NextAuth's built-in redirect callback, preventing open redirect abuse.

- **OAuth users cannot change password via credentials endpoint** — `change-password/route.ts:34–39` checks for the presence of `user.password` and returns 400 for OAuth-only accounts, preventing unexpected behavior.

- **JWT session strategy with Prisma adapter** — Using `strategy: "jwt"` (`auth.ts:14`) is appropriate given the Neon serverless database; it avoids a DB round-trip on every request while the Prisma adapter is still used for OAuth account linking and the VerificationToken model.

- **Token generation uses CSPRNG** — `lib/tokens.ts:1` imports `randomUUID` from Node.js's built-in `crypto` module, which uses the OS CSPRNG. This is cryptographically appropriate.

- **Split auth config pattern correctly implemented** — The edge-compatible `auth.config.ts` placeholder credentials provider (`authorize: () => null`) and the full bcrypt-using credentials provider in `auth.ts` correctly prevent bcrypt from running in the Edge runtime while still registering the provider for CSRF and form rendering purposes.
