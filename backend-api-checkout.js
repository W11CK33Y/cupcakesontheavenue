/*
 * Checkout & order processing endpoints
 * - sends email to customer and shop
 * - optionally creates a Stripe checkout session
 *
 * Drop this file into your Express-based backend and mount it with:
 *
 *     const checkoutRouter = require('./backend-api-checkout');
 *     app.use('/api', checkoutRouter);
 *
 * Environment variables used:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS  - for nodemailer transport
 *   SHOP_EMAIL                               - address to receive order copies
 *   STRIPE_SECRET (optional)                 - to generate a Stripe session URL
 *
 * In production replace the simple in-memory sketch with a real database.
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// ------------------------------------------------------------------
// basic mailer setup; you can replace with any transactional provider
// ------------------------------------------------------------------
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

// optional Stripe integration
let stripe;
if (process.env.STRIPE_SECRET) {
  const Stripe = require('stripe');
  stripe = Stripe(process.env.STRIPE_SECRET);
}

// helper to format a simple HTML order summary
function formatOrderHtml(order) {
  return `
    <h2>Order Reference: ${order.reference}</h2>
    <p><strong>Name:</strong> ${order.name}</p>
    <p><strong>Email:</strong> ${order.email}</p>
    <p><strong>Phone:</strong> ${order.phone}</p>
    <p><strong>Delivery:</strong> ${order.delivery}</p>
    <p><strong>Date:</strong> ${order.date}</p>
    <p><strong>Address:</strong> ${order.address}</p>
    <p><strong>Notes:</strong> ${order.notes}</p>
    <p><strong>Items:</strong> ${order.items}</p>
    <p><strong>Total:</strong> £${order.total}</p>
  `;
}

// In-memory store for orders that haven't been paid yet
const pendingOrders = new Map();

// POST /api/checkout
router.post('/checkout', async (req, res) => {
  try {
    const order = req.body;
    // minimal validation
    if (!order || !order.email || !order.reference) {
      return res.status(400).json({
        success: false,
        error: 'Missing order data (email/reference required)'
      });
    }

    // save order for later (webhook will send email once paid)
    pendingOrders.set(order.reference, order);

    // optional: post a brief order summary to a Discord webhook immediately
    if (process.env.ORDER_WEBHOOK) {
      try {
        const discordPayload = {
          content: `📦 **New order placed** (awaiting payment)\nReference: ${order.reference}\nTotal: £${order.total}\nCustomer: ${order.name} <${order.email}>`,
        };
        await fetch(process.env.ORDER_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordPayload)
        });
      } catch (dErr) {
        console.warn('Failed to send Discord notification:', dErr);
      }
    }

    // create stripe session if stripe is configured
    if (stripe) {
      // build line items (expects order.items array or string); this is a
      // best-effort example where front‑end passes items as array of objects
      let line_items = [];
      if (Array.isArray(order.line_items)) {
        line_items = order.line_items.map(i => ({
          price_data: {
            currency: 'gbp',
            product_data: { name: i.name },
            unit_amount: Math.round(i.price * 100)
          },
          quantity: i.quantity
        }));
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        customer_email: order.email,               // ensure Stripe knows the buyer's email
        success_url: (process.env.SUCCESS_URL || 'https://yourdomain.com/success') + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: (process.env.CANCEL_URL || 'https://yourdomain.com/cancel'),
        // include reference in metadata so we can find it in webhook
        metadata: { order_reference: order.reference }
      });

      return res.json({ success: true, stripeUrl: session.url });
    }

    // if no stripe, just acknowledge (and send email immediately)
    // We'll fall back to the old behaviour if stripe isn't configured:
    if (!stripe) {
      const customerMail = {
        from: process.env.SHOP_EMAIL || 'orders@cupcakesontheavenue.co.uk',
        to: order.email,
        subject: `Order placed (${order.reference})`,
        html: `<p>Hi ${order.name || 'Customer'},</p>
               <p>Thanks for your order! Below is a full summary including your reference number.</p>
               ${formatOrderHtml(order)}
               <p>We will contact you when the order is ready.</p>`
      };
      const shopMail = {
        from: process.env.SHOP_EMAIL || 'orders@cupcakesontheavenue.co.uk',
        to: process.env.SHOP_EMAIL || 'cupcakesontheavenue@gmail.com',
        subject: `🧁 New order #${order.reference} from ${order.name || order.email}`,
        html: `<h1>New order received</h1>${formatOrderHtml(order)}`
      };
      await Promise.all([mailer.sendMail(customerMail), mailer.sendMail(shopMail)]);
      res.json({ success: true });
    } else {
      res.json({ success: true });
    }
  } catch (err) {
    console.error('Error /api/checkout:', err);
    res.status(500).json({ success: false, error: 'Failed to process order' });
  }
});

// ------------------------------------------------------------------
// Stripe webhook handler (fires when payment completes)
// ------------------------------------------------------------------

// raw body needed for signature verification
router.post('/checkout-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(400).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // if no secret, just parse body (not recommended for production)
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event types you care about
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const orderRef = session.metadata?.order_reference;
      if (orderRef && pendingOrders.has(orderRef)) {
        const order = pendingOrders.get(orderRef);
        // send emails now that payment has succeeded
        const customerMail = {
          from: process.env.SHOP_EMAIL || 'orders@cupcakesontheavenue.co.uk',
          to: order.email,
          subject: `Order ${order.reference} confirmed`,
          html: `<p>Hi ${order.name || 'Customer'},</p>
               <p>Your payment has been received! Here’s a full copy of your order details:</p>
               ${formatOrderHtml(order)}
               <p>We will contact you when the order is ready.</p>`
        };
        const shopMail = {
          from: process.env.SHOP_EMAIL || 'orders@cupcakesontheavenue.co.uk',
          to: process.env.SHOP_EMAIL || 'cupcakesontheavenue@gmail.com',
          subject: `🧁 Paid order #${order.reference} from ${order.name || order.email}`,
          html: `<h1>Order paid</h1>${formatOrderHtml(order)}`
        };
        try {
          await Promise.all([mailer.sendMail(customerMail), mailer.sendMail(shopMail)]);
          pendingOrders.delete(orderRef);
          console.log('Emails sent for order', orderRef);
        } catch (mailErr) {
          console.error('Failed to send emails after payment:', mailErr);
        }
      } else {
        console.warn('Order reference not found for webhook:', orderRef);
      }
      break;
    }
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.canceled': {
      // session never completed; remove pending order and optionally notify
      const session = event.data.object;
      const orderRef = session.metadata?.order_reference;
      if (orderRef && pendingOrders.has(orderRef)) {
        pendingOrders.delete(orderRef);
        console.log('Removed pending order after failed/cancelled payment', orderRef);
        // you could also notify shop of the failed payment here
        if (process.env.ORDER_WEBHOOK) {
          try {
            const discordPayload = {
              content: `⚠️ Order payment failed or cancelled\nReference: ${orderRef}\nCustomer: ${session.customer_email || 'unknown'}`
            };
            await fetch(process.env.ORDER_WEBHOOK, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(discordPayload)
            });
          } catch (dErr) {
            console.warn('Failed to send failure notice to Discord:', dErr);
          }
        }
      }
      break;
    }
    default:
      // ignore other events
      break;
  }

  // Return a 200 to acknowledge receipt of the event
  res.json({ received: true });
});

module.exports = router;
