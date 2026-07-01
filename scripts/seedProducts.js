import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tableName = process.env.SUPABASE_PRODUCTS_TABLE?.trim() || 'products';

if (!supabaseUrl || (!supabaseAnonKey && !serviceRoleKey)) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in scaling-waffle-API/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const products = [
  {
    name: 'Atelier Waffle Wallet',
    category: 'wallets',
    price: 425.0,
    quantity: 15,
    description: 'Precision-crafted leather bifold with cross-grain texture and minimalist profiles.',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    sku: 'CW-001',
    in_stock: true,
  },
  {
    name: 'Modular Travel Briefcase',
    category: 'bags',
    price: 850.0,
    quantity: 8,
    description: 'Full-grain Italian hide featuring dedicated hardware protection grids.',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    sku: 'CB-002',
    in_stock: true,
  },
  {
    name: 'Classic Matte Belt',
    category: 'belts',
    price: 280.0,
    quantity: 24,
    description: 'Vegetable-tanned utility belt featuring raw edge tracking finishes.',
    image_url: 'https://images.unsplash.com/photo-1624222247344-550fb8ef986d?auto=format&fit=crop&w=800&q=80',
    sku: 'CB-003',
    in_stock: true,
  },
];

async function seed() {
  console.log(`Seeding ${products.length} products into ${tableName}...`);

  const { data, error } = await supabase
    .from(tableName)
    .insert(products)
    .select();

  if (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }

  console.log('Seed successful. Inserted products:');
  console.table(data);
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed script error:', error);
  process.exit(1);
});