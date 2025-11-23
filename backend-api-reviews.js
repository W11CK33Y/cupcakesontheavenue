/**
 * Reviews API Endpoints for Cupcakes on the Avenue
 * Add this to your sumup-backend project
 */

// If using Express.js, add these routes to your app

const express = require('express');
const router = express.Router();

// In-memory storage (replace with database in production)
// For production, use MongoDB, PostgreSQL, or Supabase
let reviews = [
  {
    id: 'review_1',
    name: 'Sarah M.',
    email: 'sarah@example.com',
    rating: 5,
    product: 'Shortbread Delight',
    reviewText: 'The Shortbread Delight is absolutely incredible! Best shortbread I\'ve ever had. Buttery, crumbly perfection. I ordered for a party and everyone was asking where I got them. Will definitely order again!',
    verified: true,
    approved: true,
    createdAt: new Date('2025-11-21').toISOString()
  },
  {
    id: 'review_2',
    name: 'James P.',
    email: 'james@example.com',
    rating: 5,
    product: 'Christmas Cake - Royal Icing',
    reviewText: 'Ordered a Christmas cake for our family celebration. The royal icing was beautiful and the cake was moist and delicious. Great communication and delivery was on time. Highly recommend!',
    verified: true,
    approved: true,
    createdAt: new Date('2025-11-16').toISOString()
  },
  {
    id: 'review_3',
    name: 'Emma L.',
    email: 'emma@example.com',
    rating: 5,
    product: 'Cupcakes',
    reviewText: 'Found them at Highworth Market and I\'m so glad I did! The cupcakes are amazing - perfectly moist with just the right amount of frosting. Love supporting a local business that clearly cares about quality.',
    verified: true,
    approved: true,
    createdAt: new Date('2025-11-09').toISOString()
  }
];

/**
 * GET /api/reviews
 * Fetch all approved reviews
 */
router.get('/reviews', (req, res) => {
  try {
    // Only return approved reviews
    const approvedReviews = reviews
      .filter(review => review.approved)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first
    
    res.json({
      success: true,
      reviews: approvedReviews,
      count: approvedReviews.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    });
  }
});

/**
 * POST /api/reviews
 * Submit a new review
 */
router.post('/reviews', async (req, res) => {
  try {
    const { name, email, rating, product, reviewText } = req.body;
    
    // Validation
    if (!name || !email || !rating || !reviewText) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, rating, and reviewText are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }
    
    // Validate text length
    if (reviewText.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Review text must be at least 10 characters'
      });
    }
    
    if (reviewText.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Review text must be less than 1000 characters'
      });
    }
    
    // Create new review
    const newReview = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      rating: parseInt(rating),
      product: product || null,
      reviewText: reviewText.trim(),
      verified: false, // Set to true if you verify the purchase
      approved: false, // Manual approval required
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to storage (in production, save to database)
    reviews.push(newReview);
    
    // Optional: Send notification to Discord
    await notifyNewReview(newReview);
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will be published after verification.',
      reviewId: newReview.id
    });
    
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit review'
    });
  }
});

/**
 * PATCH /api/reviews/:id/approve
 * Approve a review (admin only)
 */
router.patch('/reviews/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const review = reviews.find(r => r.id === id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    review.approved = true;
    review.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Review approved',
      review
    });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve review'
    });
  }
});

/**
 * DELETE /api/reviews/:id
 * Delete a review (admin only)
 */
router.delete('/reviews/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = reviews.findIndex(r => r.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    reviews.splice(index, 1);
    
    res.json({
      success: true,
      message: 'Review deleted'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
});

/**
 * GET /api/reviews/pending
 * Get all pending reviews (admin only)
 */
router.get('/reviews/pending', (req, res) => {
  try {
    const pendingReviews = reviews
      .filter(review => !review.approved)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      reviews: pendingReviews,
      count: pendingReviews.length
    });
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending reviews'
    });
  }
});

/**
 * Send Discord notification for new review
 */
async function notifyNewReview(review) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;
    
    const stars = '⭐'.repeat(review.rating);
    
    const embed = {
      title: '📝 New Review Submitted',
      color: 0x667eea,
      fields: [
        { name: '👤 Name', value: review.name, inline: true },
        { name: '⭐ Rating', value: stars, inline: true },
        { name: '📦 Product', value: review.product || 'General', inline: true },
        { name: '💬 Review', value: review.reviewText.substring(0, 1000) },
        { name: '📧 Email', value: review.email },
        { name: '🔗 Review ID', value: review.id }
      ],
      footer: { text: 'Click approve to publish this review' },
      timestamp: review.createdAt
    };
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '⚠️ New review needs approval!',
        embeds: [embed]
      })
    });
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
  }
}

module.exports = router;

// Usage in your main app file (e.g., index.js or app.js):
// const reviewsRouter = require('./routes/reviews');
// app.use('/api', reviewsRouter);
