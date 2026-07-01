import crypto from 'crypto';
import express from 'express';
import { serviceSupabase, supabase, SUPABASE_PRODUCTS_TABLE } from '../lib/supabase.js';
import { verifyAdmin } from '../middlewares/adminAuth.js';
import { sendOrderEmails } from '../services/emailService.js';
import { env } from '../env.js';

const router = express.Router();

/**
 * Data Normalization Helper
 * Maps database snakes (image_url, in_stock) cleanly to frontend camelCase schemas
 */
function normalizeProduct(row, index = 0) {
  return {
    id: String(row.id ?? row.product_id ?? row.uuid ?? `${row.name ?? 'product'}-${index}`),
    name: String(row.name ?? 'Untitled product'),
    category: String(row.category ?? 'wallets'),
    price: Number(row.price ?? 0),
    quantity: Number(row.quantity ?? 0),
    description: String(row.description ?? ''),
    image: String(row.image ?? row.image_url ?? ''),
    sku: String(row.sku ?? ''),
    inStock: Boolean(row.in_stock ?? row.inStock ?? true),
  };
}

// =========================================================================
// --- PUBLIC ROUTES ---
// =========================================================================

// 1. GET ALL PRODUCTS (Read)
router.get('/products', async (req, res, next) => {
  try {
    const { data: products, error } = await supabase
      .from(SUPABASE_PRODUCTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map rows through normalization so the UI properties don't break
    const normalizedData = (products ?? []).map((row, index) => normalizeProduct(row, index));
    res.status(200).json(normalizedData);
  } catch (error) {
    console.error('Supabase product fetch error:', error.message);
    next(error); // Passes smoothly to your global safety net
  }
});

// 2. GET SINGLE PRODUCT BY ID (Read)
router.get('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: product, error } = await supabase
      .from(SUPABASE_PRODUCTS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({ message: 'Product item fields not found inside remote database' });
    }

    res.status(200).json(normalizeProduct(product));
  } catch (error) {
    next(error);
  }
});

// 3. POST TRANSACTIVE CHECKOUT (Email Notification System)
router.post('/checkout', async (req, res, next) => {
  try {
    const { customerEmail, orderSummary } = req.body;

    if (!customerEmail || !orderSummary) {
      return res.status(400).json({ error: 'Missing customer details or order summary' });
    }

    // Triggers Resend / Nodemailer transactional email sequence
    await sendOrderEmails({ customerEmail, orderDetails: orderSummary });

    res.status(200).json({ message: 'Order processed successfully! Emails sent.' });
  } catch (error) {
    console.error('Checkout processing error:', error);
    next(error);
  }
});

// 4. PAYFAST CHECKOUT REDIRECT
router.post('/payfast/checkout', async (req, res, next) => {
  try {
    const { items, shippingData } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order items.' });
    }

    const merchantId = env.PAYFAST_MERCHANT_ID;
    const merchantKey = env.PAYFAST_MERCHANT_KEY;

    if (!merchantId || !merchantKey) {
      return res.status(500).json({ error: 'Payfast merchant credentials are not configured.' });
    }

    const amount = items.reduce((sum, item) => {
      const price = Number(item.price ?? 0);
      const quantity = Number(item.quantity ?? 1);
      return sum + price * quantity;
    }, 0);

    const returnUrl = env.PAYFAST_RETURN_URL || 'http://localhost:4200/checkout?status=success';
    const cancelUrl = env.PAYFAST_CANCEL_URL || 'http://localhost:4200/checkout?status=cancel';
    const notifyUrl = env.PAYFAST_NOTIFY_URL || 'http://localhost:4000/api/payfast/notify';

    const paymentData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      name_first: shippingData?.fullName ? String(shippingData.fullName).split(' ')[0] : 'Customer',
      name_last: shippingData?.fullName ? String(shippingData.fullName).split(' ').slice(1).join(' ') : '',
      email_address: shippingData?.email ?? '',
      m_payment_id: `sw-${Date.now()}`,
      amount: amount.toFixed(2),
      item_name: 'Scaling Waffles Order',
      item_description: `Order of ${items.length} item(s)`,
      custom_str1: shippingData?.fullName ?? '',
    };

    const signature = Object.entries(paymentData)
      .filter(([key, value]) => value !== undefined && value !== null && String(value).length > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value).replace(/\s+/g, ' '))}`)
      .join('&');

    const merchantSignature = crypto.createHash('md5').update(signature).digest('hex');

    const query = `${signature}&signature=${merchantSignature}`;
    const host = env.PAYFAST_MODE === 'live'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';

    const paymentUrl = `${host}?${query}`;

    res.status(200).json({ checkoutUrl: paymentUrl });
  } catch (error) {
    console.error('Payfast checkout error:', error);
    next(error);
  }
});

// 5. PAYFAST NOTIFY ENDPOINT
router.post('/payfast/notify', (req, res) => {
  // Payfast will post IPN notifications to this endpoint.
  // For now, we acknowledge receipt and log the payload.
  console.log('Payfast IPN payload:', req.body);
  res.status(200).send('OK');
});

// =========================================================================
// --- PROTECTED ADMIN ROUTES ---
// =========================================================================

// 4. POST NEW PRODUCT (Create)
router.post('/products', verifyAdmin, async (req, res, next) => {
  try {
    const { name, description, price, quantity, category, image, image_url, inStock } = req.body;

    // Formulate database matching keys
    const productToInsert = {
      name,
      description,
      price,
      quantity: quantity ?? 0,
      category: category ?? 'wallets',
      image_url: image_url ?? image ?? '',
      in_stock: inStock ?? true
    };

    const { data: newProduct, error } = await supabase
      .from(SUPABASE_PRODUCTS_TABLE)
      .insert([productToInsert])
      .select();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Product added successfully', 
      product: normalizeProduct(newProduct[0]) 
    });
  } catch (error) {
    console.error('Supabase product insert error:', error.message);
    next(error);
  }
});

// 5. PATCH UPDATE PRODUCT (Update)
router.patch('/products/:id', verifyAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle incoming visual camelCase adjustments back to relational database keys if present
    if (updates.image !== undefined) updates.image_url = updates.image;
    if (updates.inStock !== undefined) updates.in_stock = updates.inStock;

    const { data: updatedProduct, error } = await supabase
      .from(SUPABASE_PRODUCTS_TABLE)
      .update(updates)
      .eq('id', id)
      .select();

    if (error || !updatedProduct || updatedProduct.length === 0) {
      return res.status(404).json({ message: 'Target update transaction failed: Product not found' });
    }

    res.status(200).json(normalizeProduct(updatedProduct[0]));
  } catch (error) {
    next(error);
  }
});

// 6. DELETE PRODUCT (Delete)
router.delete('/products/:id', verifyAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from(SUPABASE_PRODUCTS_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: `Product ${id} successfully purged from data layer.` });
  } catch (error) {
    console.error('Supabase product delete error:', error.message);
    next(error);
  }
});

// 7. ADMIN SEED PRODUCTS (Create sample products securely using service role or anon key)
router.post('/seed-products', verifyAdmin, async (req, res, next) => {
  try {
    const client = serviceSupabase || supabase;

    if (!client) {
      return res.status(500).json({
        message: 'No Supabase client available to seed products. Please configure SUPABASE_URL and either SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.'
      });
    }

    const productsToInsert = req.body.products ?? [
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

    const { data, error } = await client
      .from(SUPABASE_PRODUCTS_TABLE)
      .insert(productsToInsert)
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'Seed products inserted successfully.', products: data });
  } catch (error) {
    console.error('Seed products error:', error.message);
    next(error);
  }
});

export default router;