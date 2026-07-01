import nodemailer from 'nodemailer';

/**
 * Configure the transporter using your SMTP provider details.
 * Note: Use environment variables for production credentials.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your app-specific password
  },
});

/**
 * Sends order confirmation to customer and notification to admin
 * @param {Object} orderData - Contains customerEmail and orderDetails
 */
export const sendOrderEmails = async (orderData) => {
  const { customerEmail, orderDetails } = orderData;
  const ADMIN_EMAIL = "joshuapeters5777@gmail.com";

  try {
    // 1. Email to Customer
    await transporter.sendMail({
      from: '"Scaling Waffles" <orders@scalingwaffles.com>',
      to: customerEmail,
      subject: "Order Confirmation - Scaling Waffles",
      html: `<h1>Thank you for your order!</h1><p>We are preparing: ${orderDetails.items}</p>`,
    });

    // 2. Email to Admin
    await transporter.sendMail({
      from: '"System" <noreply@scalingwaffles.com>',
      to: ADMIN_EMAIL,
      subject: "NEW ORDER RECEIVED",
      text: `New order from ${customerEmail}. Details: ${JSON.stringify(orderDetails)}`,
    });

    console.log("Emails sent successfully to customer and admin.");
  } catch (error) {
    console.error("Error sending emails:", error);
    throw new Error("Email service failed");
  }
};