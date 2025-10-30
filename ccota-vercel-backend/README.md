# CCOTA Vercel Backend

This project is a serverless backend for handling payments through the SumUp payment API. It is designed to work seamlessly with the Cupcakes on the Avenue (CCOTA) frontend application.

## Project Structure

- **api/create-checkout.js**: Serverless function that creates a checkout session with the payment provider.
- **lib/sumup.js**: Utility functions for interacting with the SumUp payment API.
- **.env.example**: Template for environment variables needed for the project.
- **package.json**: Configuration file for npm, listing dependencies and scripts.
- **vercel.json**: Configuration settings for deploying the project on Vercel.

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ccota-vercel-backend
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Environment Variables**
   Copy the `.env.example` file to `.env` and fill in the required values:
   ```bash
   cp .env.example .env
   ```

4. **Deploying to Vercel**
   If you haven't already, install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
   Then deploy your project:
   ```bash
   vercel
   ```

## Usage

Once deployed, the backend will handle payment requests from the frontend application. Ensure that the frontend is configured to point to the correct API endpoint provided by Vercel.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.

## License

This project is licensed under the MIT License. See the LICENSE file for details.