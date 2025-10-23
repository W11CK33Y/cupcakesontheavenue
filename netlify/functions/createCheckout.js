const axios = require("axios");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { total, reference } = JSON.parse(event.body);

    if (!total || !reference) {
      return { statusCode: 400, body: "Missing total or reference" };
    }

    const SUMUP_ACCESS_TOKEN = process.env.SUMUP_ACCESS_TOKEN;
    const MERCHANT_CODE = process.env.MERCHANT_CODE;

    if (!SUMUP_ACCESS_TOKEN || !MERCHANT_CODE) {
      return { statusCode: 500, body: "Server not configured properly" };
    }

    const amount = Number(parseFloat(total).toFixed(2));

    const response = await axios.post(
      "https://api.sumup.com/v0.1/checkouts",
      {
        checkout_reference: reference,
        amount,
        currency: "GBP",
        merchant_code: MERCHANT_CODE,
        return_url: "https://your-site-name.netlify.app/success",
        cancel_url: "https://your-site-name.netlify.app/cancel"

      },
      {
        headers: {
          Authorization: `Bearer ${SUMUP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ checkout_url: response.data.checkout_url }),
    };
  } catch (err) {
    console.error("SumUp error:", err.response?.data || err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to create checkout",
        details: err.response?.data || err.message,
      }),
    };
  }
};
