const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, mobile, orderItems, total, delivery, date, address, notes, businessPhone } = req.body;

    if (!email || !name || !mobile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🧁 Order Confirmation - Cupcakes on the Avenue',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .total { font-size: 1.3rem; font-weight: bold; color: #667eea; margin-top: 15px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9rem; }
            .highlight { background: #fff3e0; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
            .contact-box { background: #e8eaf6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .phone-number { font-size: 1.3rem; font-weight: bold; color: #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧁 Thank You for Your Order!</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>We've received your order and we're excited to prepare your delicious bakes! 🎉</p>
              
              <div class="order-details">
                <h2 style="color: #667eea; margin-bottom: 15px;">Order Summary</h2>
                <pre style="font-family: 'Segoe UI', Arial, sans-serif; white-space: pre-wrap; margin: 0;">${orderItems}</pre>
                <div class="total">Total: ${total}</div>
              </div>

              <div class="highlight">
                <p><strong>📦 Delivery Method:</strong> ${delivery}</p>
                <p><strong>📅 Delivery Date:</strong> ${date}</p>
                <p><strong>📍 Delivery Address:</strong> ${address}</p>
                <p><strong>📱 Your Contact Number:</strong> ${mobile}</p>
                ${notes ? `<p><strong>📝 Special Notes:</strong> ${notes}</p>` : ''}
              </div>

              <div class="contact-box">
                <p style="margin: 5px 0; font-size: 1.1rem;">For any questions or last-minute changes:</p>
                <p class="phone-number">📱 ${businessPhone || '07842 817789'}</p>
                <p style="margin: 5px 0; color: #666;">📧 CupcakesontheAvenue@gmail.com</p>
              </div>

              <p>We'll contact you shortly to confirm payment and finalize your order.</p>

              <div class="footer">
                <p><strong>Cupcakes on the Avenue</strong></p>
                <p>🎪 Find us at Highworth Market every Saturday, 8am-2pm</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(customerMailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Confirmation email sent successfully' 
    });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
};