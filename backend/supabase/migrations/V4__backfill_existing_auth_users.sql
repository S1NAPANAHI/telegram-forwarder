-- Backfill existing Supabase auth users into the users table
-- This ensures any users who registered before the auto-creation fix
-- will have proper records in the users table

INSERT INTO users (
    id, 
    email, 
    username, 
    first_name,
    last_name,
    language,
    subscription_plan,
    keywords_limit,
    channels_limit,
    is_active,
    created_at,
    last_login
)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'username', null) as username,
    COALESCE(u.raw_user_meta_data->>'first_name', null) as first_name,
    COALESCE(u.raw_user_meta_data->>'last_name', null) as last_name,
    'fa' as language,
    'free' as subscription_plan,
    10 as keywords_limit,
    5 as channels_limit,
    true as is_active,
    COALESCE(u.created_at, NOW()) as created_at,
    COALESCE(u.last_sign_in_at, u.created_at, NOW()) as last_login
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM users x WHERE x.id = u.id
)
AND u.email IS NOT NULL;

-- Log how many users were backfilled
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    RAISE NOTICE 'Backfill complete. Total users in users table: %', user_count;
END $$;