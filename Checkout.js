// netlify/functions/createCheckout.js
const axios = require('axios');

exports.handler = async function(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { total, reference } = JSON.parse(event.body);

    if (!total || !reference) {
      return { statusCode: 400, body: 'Missing total or reference' };
    }

    // Use environment variables for secret keys
    const SUMUP_ACCESS_TOKEN = process.env.SUMUP_ACCESS_TOKEN; // must be sup_sk_...
    const MERCHANT_CODE = process.env.MERCHANT_CODE;
   
    const response = await axios.post(
      'https://api.sumup.com/v0.1/checkouts',
      {
        checkout_reference: reference,
        amount: total,
        currency: "GBP",
        merchant_code: MERCHANT_CODE,
        return_url: RETURN_URL
      },
      {
        headers: {
          Authorization: `Bearer ${SUMUP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ checkout_url: response.data.checkout_url })
    };

  } catch (err) {
    console.error(err.response?.data || err.message);
    return { statusCode: 500, body: 'Failed to create checkout' };
  }
};


