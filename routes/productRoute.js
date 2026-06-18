import express from 'express';
import { validateProductPayload, validateProductPatchPayload } from '../middlewares/validate.js';
const router = express.Router();

// Your new in-memory mock database featuring leather products
// (I added a 'stock' property so it passes your Thursday validation rules!)
let products = [
    { id: 1, name: 'Leather Wallet', price: 499, stock: 20 },
    { id: 2, name: 'Leather Belt', price: 699, stock: 15 },
    { id: 3, name: 'Leather Bag', price: 1499, stock: 5 }
];

// Helper variable to auto-increment unique IDs for new products
let nextId = 4;

// ==========================================
// 1. GET - Fetch the entire product catalog
// ==========================================
router.get('/', (req, res, next) => {
    try {
        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
});

// ==========================================
// 1.5 GET - Fetch a single product by ID
// ==========================================
router.get('/:id', (req, res, next) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const product = products.find(p => p.id === productId);

        if (!product) {
            return res.status(404).json({ 
                error: "Not Found", 
                message: `Product with ID ${productId} does not exist.` 
            });
        }

        res.status(200).json(product);
    } catch (err) {
        next(err);
    }
});

// ==========================================
// 2. POST - Add a brand new product (WITH VALIDATION)
// ==========================================
router.post('/', validateProductPayload, (req, res, next) => {
    try {
        const { name, price, stock } = req.body;

        const newProduct = {
            id: nextId++,
            name,
            price,
            stock
        };

        products.push(newProduct);
        res.status(201).json(newProduct);
    } catch (err) {
        next(err); 
    }
});

// ==========================================
// 3. PUT - Completely overwrite a product (WITH VALIDATION)
// ==========================================
router.put('/:id', validateProductPayload, (req, res, next) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const { name, price, stock } = req.body;

        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            return res.status(404).json({ error: "Not Found", message: `Product with ID ${productId} does not exist.` });
        }

        products[productIndex] = {
            id: productId,
            name,
            price,
            stock
        };

        res.status(200).json(products[productIndex]);
    } catch (err) {
        next(err);
    }
});

// ==========================================
// 4. PATCH - Tweak specific details of a product
// ==========================================
router.patch('/:id', validateProductPatchPayload, (req, res, next) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const { name, price, stock } = req.body;

        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).json({ error: "Not Found", message: `Product with ID ${productId} does not exist.` });
        }

        if (name !== undefined) {
            product.name = name;
        }

        if (price !== undefined) {
            product.price = price;
        }

        if (stock !== undefined) {
            product.stock = stock;
        }

        res.status(200).json(product);
    } catch (err) {
        next(err);
    }
});

// ==========================================
// 5. DELETE - Remove a product entirely
// ==========================================
router.delete('/:id', (req, res, next) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return res.status(404).json({ error: "Not Found", message: `Product with ID ${productId} does not exist.` });
        }

        const deletedProduct = products.splice(productIndex, 1);
        res.status(200).json({ 
            message: "Product successfully deleted.", 
            product: deletedProduct[0] 
        });
    } catch (err) {
        next(err);
    }
});

export default router;