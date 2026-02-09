# Google OAuth Setup Guide

## Prerequisites

- Google Cloud Console access
- A Google account

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name: `Complaint Management System`
4. Click **Create**

### 2. Enable Google+ API

1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "People API"
3. Click **Enable**

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type → **Create**
3. Fill in the form:
   - **App name**: `College Complaint System`
   - **User support email**: your-email@gmail.com
   - **Developer contact email**: your-email@gmail.com
4. Click **Save and Continue**
5. Skip scopes for now → **Save and Continue**
6. Add test users if needed → **Save and Continue**

### 4. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Enter name: `Complaint Management Web Client`
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:5000
   ```
6. Add **Authorized redirect URIs**:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
7. Click **Create**
8. **Copy the Client ID and Client Secret**

### 5. Configure Environment Variables

#### Backend (.env)
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

#### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

## How It Works

### Frontend Flow (Implicit Grant)

```javascript
// 1. User clicks "Continue with Google" button
// 2. Google OAuth popup opens
// 3. User logs in with Google
// 4. Access token returned to frontend
// 5. Frontend sends token to backend
```

### Backend Verification

```javascript
// Backend receives access token
// Fetches user info from Google
// Creates/updates user in database
// Creates session and sets cookie
```

## Code Reference

### Frontend: GoogleLoginButton.jsx
```jsx
import { useGoogleLogin } from '@react-oauth/google';

const login = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    // Send to backend
    await api.post('/auth/google', {
      credential: tokenResponse.access_token
    });
  },
  flow: 'implicit'
});
```

### Backend: authController.js
```javascript
const googleAuth = async (req, res) => {
  const { credential } = req.body;
  
  // Fetch user info from Google
  const googleUser = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    { headers: { Authorization: `Bearer ${credential}` }}
  ).then(res => res.json());
  
  // Find or create user
  let user = await User.findOne({ googleId: googleUser.sub });
  
  if (!user) {
    // New user - require department selection
    // ... create user with department
  }
  
  // Create session
  const session = await Session.createSession(user._id, req);
  
  // Set cookie
  res.cookie('sessionId', session.sessionId, { ... });
};
```

## Testing the Integration

1. Start both backend and frontend servers
2. Go to http://localhost:5173/login
3. Click "Continue with Google"
4. Log in with your Google account
5. For new users, select department and role
6. Verify redirect to dashboard

## Troubleshooting

### "popup_closed_by_user"
- User closed the popup before completing login
- Try again

### "invalid_client"
- Check if Client ID matches in both .env files
- Verify the origins are correctly configured

### "redirect_uri_mismatch"
- Ensure redirect URI exactly matches in Google Console
- Include trailing slashes if any

### User Not Created
- Check if department selection modal appeared
- Verify backend logs for errors

## Production Setup

For production deployment:

1. Add production URLs to Authorized origins:
   ```
   https://your-domain.com
   ```

2. Add production redirect URIs:
   ```
   https://your-domain.com/api/auth/google/callback
   ```

3. Publish OAuth consent screen if needed

4. Update environment variables with production URLs
