// js/supabase.js — Supabase client initialization
// ─────────────────────────────────────────────────────────────
// IMPORTANT: Replace these two values with your own project credentials.
// Get them from: Supabase Console → Project Settings → API
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL      = 'YOUR_SUPABASE_PROJECT_URL';   // e.g. https://abcdef.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_PUBLIC_KEY'; // starts with eyJ...

// Create the Supabase client (available globally as `_sb`)
const { createClient } = supabase; // from CDN
const _sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth helpers ──────────────────────────────────────────────

// Sign up with email + password, store extra profile data
async function sbSignUp({ email, password, username, fullName, phone, employeeId, companyName }) {
  // 1. Create Supabase Auth user
  const { data, error } = await _sb.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name: fullName } // stored in auth.users metadata
    }
  });
  if (error) throw error;

  const uid = data.user.id;

  // 2. Upsert company
  let companyId = null;
  const compSlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const { data: existingComp } = await _sb.from('companies').select('id').ilike('name', companyName).single();
  if (existingComp) {
    companyId = existingComp.id;
  } else {
    const { data: newComp, error: compErr } = await _sb.from('companies').insert({ name: companyName }).select().single();
    if (compErr) throw compErr;
    companyId = newComp.id;
  }

  // 3. Insert user profile
  const { error: profileErr } = await _sb.from('users').insert({
    id: uid,
    username,
    full_name: fullName,
    email,
    phone,
    employee_id: employeeId,
    company_id: companyId,
    company_name: companyName,
    role: 'employee'
  });
  if (profileErr) throw profileErr;

  return data.user;
}

// Sign in with username (look up email first) or directly with email
async function sbSignIn(usernameOrEmail, password) {
  let email = usernameOrEmail;

  // If it doesn't look like an email, look up the email by username
  if (!usernameOrEmail.includes('@')) {
    const { data, error } = await _sb.rpc('get_email_by_username', { uname: usernameOrEmail });
    if (error || !data) throw new Error('Username not found. Please check your username.');
    email = data;
  }

  const { data, error } = await _sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

// Get current logged-in user's profile
async function sbGetProfile() {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return null;
  const { data, error } = await _sb.from('users').select('*').eq('id', user.id).single();
  if (error) throw error;
  return data;
}

// Sign out
async function sbSignOut() {
  await _sb.auth.signOut();
  window.location.href = 'login.html';
}

// Update password (used in forgot-password flow)
async function sbUpdatePassword(newPassword) {
  const { error } = await _sb.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// Get phone number by email (for forgot password dual OTP)
async function sbGetPhoneByEmail(email) {
  const { data, error } = await _sb.rpc('get_phone_by_email', { user_email: email });
  if (error || !data) throw new Error('No account found with that email.');
  return data;
}
