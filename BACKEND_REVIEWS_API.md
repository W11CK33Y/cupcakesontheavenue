# Backend Reviews API Documentation

## Overview
The review system now integrates with your backend at `https://sumup-backend.vercel.app`

## Required API Endpoints

### 1. GET /api/reviews
**Purpose:** Fetch all approved reviews

**Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "id": "review_123",
      "name": "Sarah M.",
      "email": "sarah@example.com",
      "rating": 5,
      "product": "Shortbread Delight",
      "reviewText": "Amazing product!",
      "verified": true,
      "approved": true,
      "createdAt": "2025-11-20T10:30:00Z"
    }
  ]
}
```

### 2. POST /api/reviews
**Purpose:** Submit a new review

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "rating": 5,
  "product": "Christmas Cake - Royal Icing",
  "reviewText": "Absolutely delicious!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "reviewId": "review_456"
}
```

## Database Schema

### Reviews Table
```javascript
{
  id: String (unique),
  name: String (required),
  email: String (required),
  rating: Number (1-5, required),
  product: String (optional),
  reviewText: String (required),
  verified: Boolean (default: false),
  approved: Boolean (default: false),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## Implementation Notes

1. **Approval System**: New reviews should be set to `approved: false` by default
2. **Verification**: `verified` badge shows for customers who made a purchase
3. **Email Validation**: Backend should validate email format
4. **Rate Limiting**: Consider implementing rate limiting (e.g., 1 review per email per day)
5. **Moderation**: Admin should be able to approve/reject reviews via Discord or admin panel

## Security Considerations

- Sanitize all user inputs to prevent XSS
- Validate email addresses
- Check for spam/duplicate reviews
- Implement CORS properly for your domain
- Consider adding reCAPTCHA for form submission

## Frontend Integration

The frontend automatically:
- Loads reviews on page load
- Displays a loading spinner while fetching
- Shows fallback sample reviews if API fails
- Escapes HTML to prevent XSS
- Provides user feedback on submission

## Testing the API

You can test with curl:

```bash
# Get reviews
curl https://sumup-backend.vercel.app/api/reviews

# Submit review
curl -X POST https://sumup-backend.vercel.app/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "rating": 5,
    "product": "Shortbread Delight",
    "reviewText": "Great product!"
  }'
```

## Next Steps

1. Add these endpoints to your backend (sumup-backend.vercel.app)
2. Set up a database (MongoDB, PostgreSQL, or Supabase recommended)
3. Create an admin interface to approve/reject reviews
4. Optional: Send email notifications when new reviews are submitted
5. Optional: Integrate with your order system to auto-verify purchases
