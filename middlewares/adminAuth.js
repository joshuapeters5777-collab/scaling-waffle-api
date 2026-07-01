/**
 * Admin Authentication Middleware
 * Ensures that only the authorized administrator can access 
 * protected routes (like adding products or viewing orders).
 */
export const verifyAdmin = (req, res, next) => {
  // Define your authorized admin email from environment, with fallback.
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "joshuapeters5777@gmail.com";

  // Get the email from the request headers
  // We use a custom header 'x-admin-email'
  const userEmail = req.headers['x-admin-email'];

  // Check if the provided email matches the authorized admin
  if (userEmail && userEmail === ADMIN_EMAIL) {
    // If it matches, proceed to the next function (the controller)
    next();
  } else {
    // If no match, reject the request with a 403 Forbidden status
    res.status(403).json({ 
      success: false, 
      message: "Access Denied: You are not authorized to perform this administrative action." 
    });
  }
};