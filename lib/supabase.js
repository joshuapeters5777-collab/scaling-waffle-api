import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = supabaseAnonKey || serviceRoleKey;

// 1. Critical Infrastructure Check
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Critical Infrastructure Error: Supabase environment keys missing inside your .env file.");
  process.exit(1);
}

// 2. Initialize and Export the Supabase Client Singleton
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,     // Keeps the backend stateless
    autoRefreshToken: false,   // Prevents node background memory loops
  },
});

export const serviceSupabase = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// 3. Fallback variable parsing for your course table name mappings
export const SUPABASE_PRODUCTS_TABLE = process.env.SUPABASE_PRODUCTS_TABLE?.trim() || 'products';