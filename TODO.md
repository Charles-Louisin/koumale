# Fix Google OAuth Production Redirect Issue

## Problem
In production, Google OAuth redirects are going to `http://localhost:3000/auth/callback?token=...` instead of the production domain because the `FRONTEND_URL` environment variable is not set correctly.

## Solution
Modify the backend auth route to dynamically determine the correct frontend URL for redirects.

## Tasks
- [ ] Update backend/src/routes/auth.ts to use dynamic frontend URL detection
- [ ] Test the OAuth flow in development
- [ ] Ensure production environment variables are properly configured

## Files to Modify
- backend/src/routes/auth.ts (Google OAuth callback redirect logic)
