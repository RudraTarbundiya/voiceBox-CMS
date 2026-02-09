# Authentication & Session Flow

## Overview

This system uses **stateful session-based authentication** with signed HTTP-only cookies. No JWT tokens are used.

## Session Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Express   │────▶│   MongoDB   │
│   (Cookie)  │     │   Server    │     │  (Sessions) │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Flow Diagrams

### Registration Flow

```
User                    Frontend                   Backend                  MongoDB
 │                         │                          │                        │
 │  Fill Form              │                          │                        │
 │────────────────────────▶│                          │                        │
 │                         │  POST /auth/register     │                        │
 │                         │─────────────────────────▶│                        │
 │                         │                          │  Hash password         │
 │                         │                          │  Create User           │
 │                         │                          │──────────────────────▶ │
 │                         │                          │                        │
 │                         │                          │  Create Session        │
 │                         │                          │──────────────────────▶ │
 │                         │                          │                        │
 │                         │  Set-Cookie: sessionId   │                        │
 │                         │◀─────────────────────────│                        │
 │  Redirect to Dashboard  │                          │                        │
 │◀────────────────────────│                          │                        │
```

### Login Flow

```
User                    Frontend                   Backend                  MongoDB
 │                         │                          │                        │
 │  Enter Credentials      │                          │                        │
 │────────────────────────▶│                          │                        │
 │                         │  POST /auth/login        │                        │
 │                         │─────────────────────────▶│                        │
 │                         │                          │  Find User by Email    │
 │                         │                          │──────────────────────▶ │
 │                         │                          │                        │
 │                         │                          │  Compare Password      │
 │                         │                          │  (bcrypt)              │
 │                         │                          │                        │
 │                         │                          │  Check Session Count   │
 │                         │                          │  (Max 2, delete oldest)│
 │                         │                          │──────────────────────▶ │
 │                         │                          │                        │
 │                         │                          │  Create New Session    │
 │                         │                          │──────────────────────▶ │
 │                         │                          │                        │
 │                         │  Set-Cookie: sessionId   │                        │
 │                         │◀─────────────────────────│                        │
 │  Redirect to Dashboard  │                          │                        │
 │◀────────────────────────│                          │                        │
```

### Request Authentication Flow

```
Browser                  Express Middleware           MongoDB
   │                            │                        │
   │  Request with Cookie       │                        │
   │───────────────────────────▶│                        │
   │                            │  Read Signed Cookie    │
   │                            │  (cookie-parser)       │
   │                            │                        │
   │                            │  Validate Session      │
   │                            │───────────────────────▶│
   │                            │                        │
   │                            │  Attach req.user       │
   │                            │                        │
   │                            │  Continue to Route     │
   │◀───────────────────────────│                        │
```

## Session Configuration

### Cookie Settings

```javascript
{
  httpOnly: true,      // Prevents XSS attacks
  signed: true,        // Uses COOKIE_SECRET
  sameSite: 'lax',     // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  secure: false        // true in production (HTTPS)
}
```

### Session Rules

| Rule | Description |
|------|-------------|
| TTL | 7 days (auto-deleted via MongoDB TTL index) |
| Max Sessions | 2 per user |
| Overflow Handling | Oldest session deleted when 3rd is created |
| Logout | Session deleted from database |

## Session Schema

```javascript
{
  sessionId: String,     // UUID v4
  userId: ObjectId,      // Reference to User
  userAgent: String,     // Browser info
  ipAddress: String,     // Client IP
  createdAt: Date,
  expiresAt: Date        // TTL indexed
}
```

## Security Features

1. **Password Hashing**: bcrypt with salt rounds of 12
2. **Signed Cookies**: Prevents cookie tampering
3. **HTTP-Only**: Cookies inaccessible to JavaScript
4. **Session Validation**: Every request validates session
5. **Auto Expiry**: MongoDB TTL index cleans expired sessions
6. **Session Limit**: Max 2 sessions prevents session accumulation

## Google OAuth Flow

```
User                 Frontend              Google               Backend
 │                      │                     │                    │
 │  Click Google Btn    │                     │                    │
 │─────────────────────▶│                     │                    │
 │                      │  OAuth Popup        │                    │
 │                      │────────────────────▶│                    │
 │                      │                     │                    │
 │  Login to Google     │                     │                    │
 │────────────────────────────────────────────▶                    │
 │                      │                     │                    │
 │                      │  Access Token       │                    │
 │                      │◀────────────────────│                    │
 │                      │                     │                    │
 │                      │  POST /auth/google  │                    │
 │                      │  {credential}       │                    │
 │                      │──────────────────────────────────────────▶
 │                      │                     │                    │
 │                      │                     │  Verify Token with │
 │                      │                     │  Google OAuth2Client
 │                      │                     │◀───────────────────│
 │                      │                     │                    │
 │                      │                     │  Create/Update User│
 │                      │                     │  Create Session    │
 │                      │                     │                    │
 │                      │  Set-Cookie         │                    │
 │                      │◀─────────────────────────────────────────│
 │  Redirect Dashboard  │                     │                    │
 │◀─────────────────────│                     │                    │
```
