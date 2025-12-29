# Product Restock Notification Feature

## Overview
This feature allows users to subscribe to notifications when an out-of-stock product becomes available again. The system supports both logged-in and guest users, sending notifications via email and WhatsApp.

## Features Implemented

### 1. Database Schema
- **ProductNotification Model**: Stores notification requests with the following fields:
  - `productId`: The product to be notified about
  - `variantId`: Optional specific variant
  - `userId`: For logged-in users (optional)
  - `email`: For guest users or logged-in users
  - `phone`: For WhatsApp notifications
  - `isNotified`: Tracks if notification has been sent

### 2. Backend (GraphQL)

#### Mutations:
1. **createProductNotification**: Allows users to subscribe to restock notifications
   - Validates user input (email/phone format)
   - Checks if product/variant exists
   - Prevents duplicate subscriptions
   - Works for both logged-in and guest users

2. **notifyProductRestock**: Allows sellers to trigger notifications when restocking
   - Only the product seller can trigger notifications
   - Sends email and WhatsApp notifications to all subscribers
   - Marks notifications as sent after delivery

#### Notification Services:
- **Email**: Uses nodemailer with SMTP configuration
- **WhatsApp**: Placeholder implementation (ready for Twilio or similar service)

### 3. Frontend Components

#### NotifyMeModal Component
- Modal dialog for collecting contact information from guest users
- Tabbed interface for choosing email or phone notification
- Input validation
- Loading states

#### Updated BuyNowButton Component
- Shows "Notify Me" button when product is out of stock
- Different styling (blue gradient) for notify button vs buy button
- For logged-in users: Directly subscribes to notifications
- For guest users: Opens modal to collect email/phone
- Toast notifications for success/error feedback

### 4. User Flow

#### For Logged-in Users:
1. User visits product page
2. Sees "Notify Me" button (blue with bell icon) if out of stock
3. Clicks button
4. Immediately subscribed using their account email/phone
5. Receives success toast notification

#### For Guest Users:
1. User visits product page
2. Sees "Notify Me" button if out of stock
3. Clicks button
4. Modal appears asking for email OR phone number
5. User enters contact information
6. Clicks "Notify Me" in modal
7. Subscribed and receives success toast

#### For Sellers (Restocking):
1. Seller restocks product
2. Calls `notifyProductRestock` mutation (can be automated or manual)
3. System sends notifications to all subscribers
4. Marks notifications as sent

## Environment Variables Required

Add these to your `.env` file:

```env
# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@vanijay.com

# WhatsApp Configuration (optional - for Twilio)
# TWILIO_ACCOUNT_SID=your-account-sid
# TWILIO_AUTH_TOKEN=your-auth-token
# TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Files Created/Modified

### Created:
1. `/buyer/servers/gql/modules/productNotification/productNotification.schema.ts`
2. `/buyer/servers/gql/modules/productNotification/productNotification.resolvers.ts`
3. `/buyer/client/productNotification/productNotification.mutations.ts`
4. `/buyer/components/page/product/NotifyMeModal.tsx`

### Modified:
1. `/buyer/prisma/schema.prisma` - Added ProductNotification model
2. `/buyer/servers/gql/index.ts` - Registered productNotification module
3. `/buyer/components/common/BuyNowButton.tsx` - Added notify functionality
4. `/buyer/components/common/ProductActions.tsx` - Pass productName prop
5. `/buyer/components/page/product/ProductActionsClient.tsx` - Pass productName prop

## Testing

### Test the Feature:
1. **View out-of-stock product**: Navigate to a product page where stock is 0
2. **As guest user**: Click "Notify Me" → Enter email/phone → Submit
3. **As logged-in user**: Click "Notify Me" → Automatically subscribed
4. **Check database**: Verify entry in `product_notifications` table
5. **Seller triggers restock**: Call mutation or implement auto-trigger when stock updated
6. **Verify notifications**: Check email inbox and WhatsApp

### Manual Testing Mutation:
```graphql
# Subscribe to notification (guest)
mutation {
  createProductNotification(input: {
    productId: "your-product-id"
    email: "test@example.com"
  }) {
    id
    isNotified
  }
}

# Trigger notifications (seller only)
mutation {
  notifyProductRestock(
    productId: "your-product-id"
  ) {
    success
    message
    notifiedCount
  }
}
```

## Future Enhancements

1. **Auto-trigger on restock**: Add a hook in product update mutation to automatically trigger notifications when stock goes from 0 to > 0
2. **Notification preferences**: Allow users to choose notification method (email, WhatsApp, or both)
3. **Notification history**: Show users their active notification subscriptions in account settings
4. **Unsubscribe option**: Allow users to cancel notification requests
5. **SMS notifications**: Add SMS as an additional notification channel
6. **Analytics**: Track notification open rates and conversion rates

## Notes

- WhatsApp notifications require a Twilio account or similar service (currently placeholder)
- Email notifications require valid SMTP credentials
- The system prevents duplicate subscriptions for the same product/variant/user combination
- Notifications are only sent once per subscription (tracked by `isNotified` flag)
