# VM Deployment Guide - Cookie Authentication Fix

This guide addresses the cookie authentication issues when deploying to a VM.

## The Problem

When deploying to a VM, users get signed out immediately after login due to cookie configuration issues:

1. **Cross-domain cookie problems** - Frontend and backend on different ports/domains
2. **HTTPS requirements** - `secure: true` flag requires HTTPS
3. **SameSite restrictions** - `strict` mode blocks cross-site requests

## Configuration

The VM-specific configuration is now **hardcoded** in the source code. No additional environment variables are needed!

### What's Hardcoded

- **Cookie domain**: `20.244.0.22` (your VM IP)
- **Secure flag**: Disabled for HTTP deployment
- **SameSite**: Set to `'lax'` for cross-domain compatibility
- **CORS origins**: Includes all necessary VM URLs

### Required Environment Variable

Only set this in your `.env` file:

```env
NODE_ENV=production
```

## Key Changes Made

### 1. Cookie Configuration
- Changed `sameSite` from `'strict'` to `'lax'` for cross-domain compatibility
- Added `FORCE_HTTPS=false` option to disable secure flag for HTTP
- Added `COOKIE_DOMAIN` support for proper domain setting

### 2. CORS Configuration
- Made CORS origins configurable via environment variables
- Added support for additional origins via `ADDITIONAL_CORS_ORIGINS`

### 3. Standardized Cookie Options
- Created `getCookieOptions()` helper method
- Consistent cookie configuration across all auth endpoints

## Testing the Fix

1. **Deploy the updated backend** to your VM
2. **Set `NODE_ENV=production`** in your `.env` file
3. **Restart the backend service**
4. **Test login** - cookies should now persist

## Troubleshooting

### Still getting signed out?

1. **Check browser console** for CORS errors
2. **Verify `NODE_ENV=production`** is set in your `.env` file
3. **Check network tab** to see if cookies are being set
4. **Try different browsers** to rule out browser-specific issues

### Common Issues

1. **Wrong IP address** - The code is hardcoded for `20.244.0.22`
2. **Port mismatch** - Ensure frontend and backend ports are correct
3. **Environment not set** - Make sure `NODE_ENV=production` is set

### For HTTPS Deployment

If you're using HTTPS on your VM, you'll need to modify the code:

1. **Change `secure: false` to `secure: true`** in `auth.service.ts`
2. **Update the domain** in `auth.service.ts` to your domain
3. **Add your HTTPS URLs** to the CORS origins in `main.ts`

## Security Notes

- `sameSite: 'lax'` is more permissive than `'strict'` but still secure
- `secure: false` is set for HTTP deployment - use HTTPS in production
- For production, modify the code to use `secure: true` and your domain 