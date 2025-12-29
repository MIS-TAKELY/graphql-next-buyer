# 🔔 Automatic Restock Notifications

## Overview
The system now **automatically sends notifications** to users when a product is restocked! No manual intervention needed.

---

## How It Works

### Automatic Trigger Flow

```
Seller Updates Stock
        ↓
   Stock: 0 → 5
        ↓
System Detects Restock
        ↓
  Finds Pending Notifications
        ↓
 Sends Emails & WhatsApp
        ↓
 Marks as Sent (isNotified = true)
        ↓
   Users Receive Alerts! 📧
```

---

## Implementation Details

### 1. **Stock Update Detection**

When a seller updates variant stock via `updateVariantStock` mutation:

```typescript
// Before update
oldStock = 0

// After update  
newStock = 5

// Trigger condition
if (oldStock === 0 && newStock > 0) {
  // 🔔 TRIGGER NOTIFICATIONS!
}
```

### 2. **Notification Process**

1. **Query Database**: Find all pending notifications for that product/variant
   ```sql
   SELECT * FROM product_notifications 
   WHERE productId = '...' 
   AND variantId = '...' 
   AND isNotified = false
   ```

2. **Send Notifications**: Loop through each subscriber
   - Send email if email exists
   - Send WhatsApp if phone exists
   - Log any errors (non-blocking)

3. **Mark as Sent**: Update database
   ```sql
   UPDATE product_notifications 
   SET isNotified = true 
   WHERE id IN (...)
   ```

### 3. **Error Handling**

- Notification failures **don't block** stock updates
- Individual notification errors are logged but don't stop the loop
- Stock update always succeeds even if all notifications fail

---

## Files Modified

### Created:
1. `/buyer/servers/gql/modules/productNotification/notificationService.ts`
   - Shared email and WhatsApp notification functions
   - Can be imported by any module

### Modified:
1. `/seller/servers/gql/modules/products/product.resolvers.ts`
   - Added automatic trigger in `updateVariantStock` mutation
   - Detects stock changes from 0 to > 0
   - Sends notifications automatically

2. `/buyer/servers/gql/modules/productNotification/productNotification.resolvers.ts`
   - Now imports from shared notification service
   - Removed duplicate code

---

## Testing the Automatic Notifications

### Step 1: Subscribe to Notifications

1. Navigate to an out-of-stock product (stock = 0)
2. Click "Notify Me" button
3. Verify notification is created in database:
   ```sql
   SELECT * FROM product_notifications 
   WHERE productId = 'your-product-id' 
   AND isNotified = false;
   ```

### Step 2: Update Stock (Seller Side)

**Option A: Via GraphQL Mutation**
```graphql
mutation {
  updateVariantStock(
    variantId: "your-variant-id"
    stock: 10
  )
}
```

**Option B: Via Seller Dashboard**
1. Login as seller
2. Go to Products → Edit Product
3. Update variant stock from 0 to any number > 0
4. Save

### Step 3: Verify Notifications Sent

**Check Server Logs:**
```
🔔 Product restocked! Triggering notifications for product xxx, variant yyy
📧 Sending 2 restock notifications...
✅ Successfully notified 2 users about restock
```

**Check Database:**
```sql
SELECT * FROM product_notifications 
WHERE productId = 'your-product-id' 
AND isNotified = true;
```

**Check Email:**
- Users should receive email with subject: "[Product Name] is back in stock!"

---

## Console Logs to Watch For

### Success Flow:
```
🔔 Product restocked! Triggering notifications for product clxxx, variant clyyy
📧 Sending 3 restock notifications...
✅ Successfully notified 3 users about restock
```

### No Subscribers:
```
🔔 Product restocked! Triggering notifications for product clxxx, variant clyyy
No pending notifications found for this product/variant
```

### Notification Error (Non-Critical):
```
🔔 Product restocked! Triggering notifications for product clxxx, variant clyyy
📧 Sending 2 restock notifications...
Error sending individual notification: [error details]
✅ Successfully notified 1 users about restock
```

---

## Important Notes

### ✅ What Triggers Notifications:
- Stock update from **0 to any positive number**
- Via `updateVariantStock` mutation
- Via seller dashboard stock update

### ❌ What DOESN'T Trigger:
- Stock update from 5 to 10 (already in stock)
- Stock update from 10 to 0 (going out of stock)
- Stock update from 0 to 0 (no change)
- Manual product edits that don't change stock

### 🔐 Security:
- Only product seller can update stock
- Notifications only sent to verified subscribers
- Failed notifications don't expose user data

### 📊 Database Updates:
- `isNotified` flag set to `true` after sending
- Prevents duplicate notifications
- Users won't get notified again until they re-subscribe

---

## Troubleshooting

### Notifications Not Sending?

**1. Check SMTP Configuration**
```bash
# Verify .env has these variables
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@vanijay.com
```

**2. Check Server Logs**
Look for error messages in console

**3. Check Database**
```sql
-- Are there pending notifications?
SELECT * FROM product_notifications 
WHERE isNotified = false;

-- Was stock actually 0 before update?
SELECT stock FROM product_variants 
WHERE id = 'variant-id';
```

**4. Test Email Service**
```typescript
// Test email directly
import { sendEmailNotification } from './notificationService';

await sendEmailNotification(
  'test@example.com',
  'Test Product',
  'test-slug'
);
```

### Stock Updated But No Logs?

- Check if stock was actually 0 before update
- Verify you're using `updateVariantStock` mutation
- Check seller authorization (must own the product)

---

## Manual Trigger (Fallback)

If automatic trigger fails, sellers can manually trigger:

```graphql
mutation {
  notifyProductRestock(
    productId: "product-id"
    variantId: "variant-id"
  ) {
    success
    message
    notifiedCount
  }
}
```

---

## Future Enhancements

1. **Batch Notifications**: Queue and send in batches for better performance
2. **Retry Logic**: Retry failed notifications after delay
3. **Notification History**: Track all sent notifications
4. **User Preferences**: Let users choose notification method
5. **Notification Analytics**: Track open rates and conversions
6. **SMS Support**: Add SMS as notification channel
7. **Push Notifications**: Browser/mobile push notifications

---

## Summary

✅ **Fully Automatic**: No manual intervention needed  
✅ **Smart Detection**: Only triggers on 0 → positive stock changes  
✅ **Error Resilient**: Notification failures don't break stock updates  
✅ **Multi-Channel**: Email + WhatsApp support  
✅ **Database Tracked**: All notifications logged and marked  
✅ **Production Ready**: Tested and optimized  

**The system is now complete and will automatically notify users when products are restocked!** 🎉
