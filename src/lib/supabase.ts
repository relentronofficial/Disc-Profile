import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isStripeKey = supabaseAnonKey?.startsWith('sb_') || supabaseAnonKey?.startsWith('pk_');
const isCorrectFormat = supabaseAnonKey?.startsWith('eyJ');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing. Please check your .env.local file.");
}

if (isStripeKey) {
  console.error("CRITICAL: The NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be a Stripe key, not a Supabase key. Please get the 'anon' 'public' key from your Supabase Dashboard (Settings -> API).");
}

const createSupabaseClient = () => {
  try {
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      return createClient('https://placeholder.supabase.co', 'placeholder');
    }
    // We attempt to use the provided key even if format looks weird, just in case
    return createClient(supabaseUrl, supabaseAnonKey || 'placeholder');
  } catch (err) {
    console.error("Critical error initializing Supabase client:", err);
    return createClient('https://placeholder.supabase.co', 'placeholder');
  }
};

export const supabase = createSupabaseClient();
