# Deployment Steps to Fix Authentication Issues

## Current Status
✅ **Authentication Logic Fixed** - All code changes have been committed  
✅ **Token Refresh Working** - Frontend can successfully refresh tokens  
⚠️ **Database Migration Needed** - Production database missing `user_refresh_tokens` table  
⚠️ **500 Errors on API Calls** - Due to missing database table  

## Immediate Steps Required

### 1. Apply Database Migration to Supabase Production

The new authentication system requires a `user_refresh_tokens` table that doesn't exist in production yet.

**Option A: Apply via Supabase Dashboard**
1. Log in to [supabase.com](https://supabase.com)
2. Navigate to your project dashboard
3. Go to "SQL Editor"
4. Run this SQL command:

```sql
-- Create user_refresh_tokens table for JWT token management
CREATE TABLE user_refresh_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient token lookup
CREATE INDEX idx_user_refresh_tokens_expires_at ON user_refresh_tokens(expires_at);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_refresh_tokens_updated_at BEFORE UPDATE ON user_refresh_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Option B: Apply via Supabase CLI** (if you have it set up)
```bash
supabase db push --db-url "your-production-database-url"
```

### 2. Redeploy Backend Service on Render

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Find your backend service (`backend-service-idry`)
3. Click "Deploy latest commit" or "Manual Deploy"
4. Wait for deployment to complete

### 3. Redeploy Frontend Service on Render

1. In Render Dashboard, find your frontend service
2. Click "Deploy latest commit" or "Manual Deploy" 
3. Wait for deployment to complete

### 4. Test the Application

After both deployments complete:

1. Clear your browser cache/cookies for the app
2. Navigate to your app URL
3. Try logging in
4. Navigate to `/keywords`, `/channels`, or `/logs` pages
5. Verify no 401 or 500 errors in browser console

## Expected Results After Migration

✅ **Login works smoothly**  
✅ **All protected pages load without errors**  
✅ **No 500 errors on POST requests**  
✅ **Token refresh happens automatically**  
✅ **No more authentication loops**  

## Troubleshooting

### If 500 errors persist:
1. Check Render backend logs for specific error messages
2. Verify the `user_refresh_tokens` table was created successfully in Supabase
3. Ensure all environment variables are correctly set in Render

### If 401 errors return:
1. Clear browser cookies and localStorage
2. Try logging in again
3. Check if backend and frontend are both using the updated code

### If you get database connection errors:
1. Verify your `DATABASE_URL` environment variable in Render
2. Check Supabase connection pooling settings
3. Ensure your Supabase project is not paused

## Environment Variables to Verify

Make sure these are set correctly in your Render backend service:

- `DATABASE_URL` - Your Supabase connection string
- `JWT_SECRET` - Your JWT signing secret
- `JWT_REFRESH_SECRET` - Your refresh token secret (can be same as JWT_SECRET + '_refresh')
- `NODE_ENV=production`

## Current Code Status

🎯 **All authentication fixes are complete in the code**  
📦 **Ready for deployment**  
🗄️ **Only missing the database migration**  

Once you apply the database migration and redeploy, the authentication system should work perfectly!