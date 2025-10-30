export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { total, reference } = req.body;

    if (!total || !reference) {
        return res.status(400).json({ message: 'Total and reference are required' });
    }

    try {
        const response = await createCheckout(total, reference);
        return res.status(200).json(response);
    } catch (error) {
        console.error('Error creating checkout:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}