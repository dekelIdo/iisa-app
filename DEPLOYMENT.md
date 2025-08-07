# Deployment Guide

## Fixing Refresh Issue on Render

The issue you're experiencing where refreshing the page on routes like `/dashboard` results in a "not found" error is a common problem with Single Page Applications (SPAs) deployed to static hosting services.

### Problem
When you refresh the page on a route like `/dashboard`, the server tries to find a file at that path, but since this is a SPA, all routes should serve the same `index.html` file and let Angular's router handle the routing on the client side.

### Solution
I've created several configuration files to handle this:

1. **`public/_redirects`** - This file tells the server to serve `index.html` for all routes
2. **`vercel.json`** - Alternative configuration for Vercel deployment
3. **`netlify.toml`** - Alternative configuration for Netlify deployment
4. **`render.yaml`** - Specific configuration for Render deployment

### For Render Deployment

1. Make sure your Render service is configured as a **Static Site**
2. Set the **Build Command** to: `npm run build`
3. Set the **Publish Directory** to: `dist/iisa-app/browser`
4. The `render.yaml` file should handle the routing configuration

### Alternative: Manual Configuration on Render

If the `render.yaml` doesn't work, you can manually configure the redirects in your Render dashboard:

1. Go to your Render dashboard
2. Select your static site service
3. Go to **Settings** → **Redirects/Rewrites**
4. Add a redirect rule:
   - **From**: `/*`
   - **To**: `/index.html`
   - **Status**: `200`

### Testing the Fix

After deploying with these configurations:

1. Navigate to your app at the root URL
2. Navigate to `/dashboard` (or any other route)
3. Refresh the page - it should now work without showing "not found"
4. Try refreshing on different routes to ensure they all work

### Files Created

- `public/_redirects` - Main redirect configuration
- `vercel.json` - Vercel deployment config
- `netlify.toml` - Netlify deployment config  
- `render.yaml` - Render deployment config

These files ensure that all routes serve the main `index.html` file, allowing Angular's client-side router to handle the routing properly.
