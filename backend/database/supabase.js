const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for backend

if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable.');
}

if (!supabaseKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;