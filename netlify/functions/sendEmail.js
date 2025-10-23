const nodemailer = require("nodemailer");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Parse incoming data from success.html
    const { name, email, amount } = JSON.parse(event.body);

    if (!email || !amount) {
      return { statusCode: 400, body: "Missing email or amount" };
    }

    // Netlify environment variables
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT || 465;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // your email

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
      return { statusCode: 500, body: "SMTP not configured properly" };
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Send email to both admin and customer
    const info = await transporter.sendMail({
      from: `"Your Shop" <${SMTP_USER}>`,
      to: `${ADMIN_EMAIL}, ${email}`, // <- both addresses
      subject: "✅ Payment Confirmation",
      html: `
        <h2>Payment Confirmation</h2>
        <p><strong>Amount:</strong> £${amount}</p>
        ${name ? `<p><strong>Customer:</strong> ${name}</p>` : ""}
        <p><strong>Email:</strong> ${email}</p>
        <p>Thank you for your payment!</p>
      `
    });

    console.log("Email sent:", info.messageId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully" }),
    };

  } catch (err) {
    console.error("Email error:", err);
    return { statusCode: 500, body: "Failed to send email" };
  }
};
