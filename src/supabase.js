import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config.js';

const { url, anonKey } = CONFIG.supabase || {};

// If the key is not filled in yet, `supabase` is null and the RSVP form
// shows a friendly fallback instead of crashing the page.
export const supabaseReady = Boolean(url && anonKey && !anonKey.startsWith('PASTE_'));

export const supabase = supabaseReady
  ? createClient(url, anonKey, { auth: { persistSession: false } })
  : null;
