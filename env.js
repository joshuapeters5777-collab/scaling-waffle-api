import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  FRONTEND_ORIGIN: z.string().default('http://localhost:4200'),
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.string().default('587'),
  EMAIL_USER: z.string(), // This will be your email
  EMAIL_PASS: z.string(), // This will be your 16-character App Password
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_PRODUCTS_TABLE: z.string().default('products'),
  PAYFAST_MERCHANT_ID: z.string().optional(),
  PAYFAST_MERCHANT_KEY: z.string().optional(),
  PAYFAST_PASSPHRASE: z.string().optional(),
  PAYFAST_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
  PAYFAST_RETURN_URL: z.string().optional(),
  PAYFAST_CANCEL_URL: z.string().optional(),
  PAYFAST_NOTIFY_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);