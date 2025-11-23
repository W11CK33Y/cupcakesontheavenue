# Adding Reviews API to Your Backend

## Step-by-Step Instructions

### 1. Copy the API File
Copy `backend-api-reviews.js` to your backend project:
```
C:\Users\jack\Downloads\sumup-backend\api\reviews.js
```
(or wherever your API routes are located)

### 2. Install Required Dependencies (if not already installed)
```bash
cd C:\Users\jack\Downloads\sumup-backend
npm install express cors
```

### 3. Update Your Main Server File

If using **Vercel/Next.js API Routes**, create:
`C:\Users\jack\Downloads\sumup-backend\api\reviews.js`

```javascript
// For Vercel serverless functions
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Import and use the reviews router from backend-api-reviews.js
  // (You'll need to adapt the code to serverless format)
}
```

If using **Express.js**, update your main file:

```javascript
const express = require('express');
const cors = require('cors');
const reviewsRouter = require('./api/reviews'); // or your path

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', reviewsRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 4. Environment Variables

Add to your `.env` file:
```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1441917103153090671/KNupEAUqkfz0orXHbo31YH7_0ZmV8cIprHZr8rNFn1nDNfA-UUijrfUSPnzV7IYcKErB
```

### 5. Database Setup (Recommended)

For production, replace the in-memory storage with a real database:

**Option A: MongoDB**
```bash
npm install mongodb
```

**Option B: PostgreSQL**
```bash
npm install pg
```

**Option C: Supabase (Easiest)**
```bash
npm install @supabase/supabase-js
```

Then update the reviews array to use database queries.

### 6. Test the API

Once deployed, test with:

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
    "reviewText": "Amazing product, highly recommend!"
  }'
```

### 7. Deploy

```bash
# If using Vercel
vercel --prod

# If using other hosting
git add .
git commit -m "Add reviews API"
git push
```

## API Endpoints Created

- `GET /api/reviews` - Get all approved reviews
- `POST /api/reviews` - Submit new review
- `GET /api/reviews/pending` - Get pending reviews (admin)
- `PATCH /api/reviews/:id/approve` - Approve a review (admin)
- `DELETE /api/reviews/:id` - Delete a review (admin)

## Security Notes

- Add authentication for admin endpoints (approve, delete, pending)
- Implement rate limiting to prevent spam
- Consider adding reCAPTCHA to the review form
- Sanitize all user inputs before storing

## Next Steps

1. Copy the files to your backend folder
2. Install dependencies
3. Add database connection
4. Deploy to Vercel
5. Test the endpoints
6. Create admin panel to manage reviews (optional)

The frontend is already configured and will work once the backend is deployed!
