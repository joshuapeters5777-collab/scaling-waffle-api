export function validateProductPayload(req, res, next) {
    const { name, price, stock } = req.body;

    if (name === undefined || price === undefined || stock === undefined) {
        return res.status(400).json({
            error: "Bad Request",
            message: "Missing required fields. 'name', 'price', and 'stock' are mandatory."
        });
    }

    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Bad Request", message: "'name' must be a non-empty string." });
    }

    if (isNaN(price) || parseFloat(price) < 0) {
        return res.status(400).json({ error: "Bad Request", message: "'price' must be a positive number." });
    }

    if (!Number.isInteger(Number(stock)) || parseInt(stock, 10) < 0) {
        return res.status(400).json({ error: "Bad Request", message: "'stock' must be a positive whole integer." });
    }

    req.body.name = name.trim();
    req.body.price = parseFloat(price);
    req.body.stock = parseInt(stock, 10);

    next();
}

export function validateProductPatchPayload(req, res, next) {
    const { name, price, stock } = req.body;

    if (name === undefined && price === undefined && stock === undefined) {
        return res.status(400).json({
            error: "Bad Request",
            message: "At least one field ('name', 'price', or 'stock') must be provided."
        });
    }

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: "Bad Request", message: "'name' must be a non-empty string." });
        }
        req.body.name = name.trim();
    }

    if (price !== undefined) {
        if (isNaN(price) || parseFloat(price) < 0) {
            return res.status(400).json({ error: "Bad Request", message: "'price' must be a positive number." });
        }
        req.body.price = parseFloat(price);
    }

    if (stock !== undefined) {
        if (!Number.isInteger(Number(stock)) || parseInt(stock, 10) < 0) {
            return res.status(400).json({ error: "Bad Request", message: "'stock' must be a positive whole integer." });
        }
        req.body.stock = parseInt(stock, 10);
    }

    next();
}
