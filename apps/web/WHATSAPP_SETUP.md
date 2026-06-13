# WhatsApp Notification System for Rehab Store

This system sends WhatsApp messages to the store owner when customers place orders.

## Setup Instructions

### 1. Facebook Developer Account
1. Go to https://developers.facebook.com/
2. Sign up with your Facebook account
3. Create a new app (type: Business)
4. Add WhatsApp product to your app

### 2. WhatsApp Business API Setup
1. In your app, go to WhatsApp → Getting Started
2. Add a phone number (you can use your existing number)
3. Verify the phone number via SMS
4. Get your Phone Number ID and Access Token

### 3. Environment Variables
Add these to your `.env` file:

```bash
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_API_VERSION=v18.0
```

### 4. Database Setup
Run the SQL migration in your Supabase Dashboard → SQL Editor:

```sql
-- Orders table for WhatsApp notifications
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  whatsapp_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Test the System
1. Start your development server: `npm run dev --workspace=apps/web`
2. Go to: `http://localhost:3000/en/test-whatsapp`
3. Fill in the test order details
4. Click "Create Order & Send WhatsApp"
5. Check your WhatsApp for the message

## Message Format
When an order is placed, you'll receive a WhatsApp message like this:

```
🛍️ *New Order #ORD-1234567890*

*Customer:* John Doe
*Phone:* +1234567890

*Items:*
• Soft Tailoring Dress x1 - AED 1290.00

*Total:* AED 1290.00

Thank you for your order! 🙏
```

## API Endpoints

### POST /api/orders
Creates a new order and sends WhatsApp notification.

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_phone": "+1234567890",
  "customer_email": "john@example.com",
  "items": [
    {
      "name": "Soft Tailoring Dress",
      "quantity": 1,
      "price": 129000,
      "color": "Bone",
      "size": "M"
    }
  ],
  "total_amount": 129000,
  "currency": "AED",
  "notes": "Test order"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "order_number": "ORD-1234567890",
    "status": "pending",
    "total_amount": 129000,
    "currency": "AED",
    "whatsapp_sent": true
  },
  "whatsapp": {
    "message_id": "whatsapp_message_id",
    "error": null
  }
}
```

## Troubleshooting

### WhatsApp messages not sending
1. Check your environment variables are set correctly
2. Verify your WhatsApp Business API access is approved
3. Check the browser console for error messages
4. Ensure your phone number is verified in WhatsApp Business

### Common errors
- **"WhatsApp API credentials not configured"**: Missing environment variables
- **"Invalid access token"**: Your access token is expired or invalid
- **"Phone number not verified"**: Complete phone verification in Facebook Developer portal

## Cost
- WhatsApp Business API: Free for sandbox/development
- Production: ~$0.01 per message (first 1,000 messages/month free)
- Supabase: Free tier (10GB storage, 500MB bandwidth)

## Next Steps
1. Apply for WhatsApp Business API access
2. Set up environment variables
3. Test with your phone number
4. Deploy to production
5. Add order management UI

For help, contact support or check the Facebook Developer documentation.