// ===================================================================
// Supabase configuration for the Certificates page.
//
// 1. Go to your Supabase project -> Project Settings -> API
// 2. Copy the "Project URL" and the "anon public" key (NOT the
//    service_role key — that one must never appear in this file
//    or anywhere in your public site).
// 3. Paste them below.
//
// The anon key is *meant* to be public — it's safe to publish on
// GitHub Pages. Security is enforced by Row Level Security (RLS)
// policies on the Supabase side, not by hiding this key.
// ===================================================================

const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
