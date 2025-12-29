# Testing Product Notification Feature

## Quick Test Steps

### 1. Prepare Test Environment

Make sure your database is updated:
```bash
cd /home/mistakely/Desktop/project/dai/buyer
npx prisma db push
```

### 2. Configure Email (Optional but Recommended)

Add to your `.env` file:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@vanijay.com
```

For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use that password in SMTP_PASS

### 3. Test as Guest User

1. Start the dev server: `npm run dev`
2. Navigate to a product page with 0 stock
3. You should see a blue "Notify Me" button instead of "Buy Now"
4. Click the "Notify Me" button
5. A modal should appear asking for email or phone
6. Enter your email address
7. Click "Notify Me" in the modal
8. You should see a success toast message

### 4. Test as Logged-in User

1. Sign in to your account
2. Navigate to a product page with 0 stock
3. Click the "Notify Me" button
4. You should immediately see a success toast (no modal)
5. The notification is created using your account email

### 5. Verify in Database

Check if the notification was created:
```sql
SELECT * FROM product_notifications 
WHERE "productId" = 'your-product-id' 
ORDER BY "createdAt" DESC;
```

### 6. Test Seller Notification Trigger (GraphQL Playground)

As the seller of the product, trigger notifications:

```graphql
mutation {
  notifyProductRestock(productId: "your-product-id") {
    success
    message
    notifiedCount
  }
}
```

### 7. Check Email

If SMTP is configured correctly, you should receive an email with:
- Subject: "[Product Name] is back in stock!"
- A nicely formatted HTML email
- A link to the product page

## Troubleshooting

### "Notify Me" button not showing
- Check if product stock is actually 0
- Check browser console for errors
- Verify the `inStock` prop is being calculated correctly

### Modal not opening for guest users
- Check browser console for errors
- Verify the NotifyMeModal component is imported correctly
- Check if there are any z-index conflicts

### Email not sending
- Verify SMTP credentials are correct
- Check server logs for email errors
- Try with a different email provider
- For Gmail, ensure app-specific password is used

### GraphQL errors
- Check if the productNotification module is registered in `/buyer/servers/gql/index.ts`
- Verify Prisma client is generated: `npx prisma generate`
- Check server logs for detailed error messages

## Common Issues

1. **"Product information missing" error**: Make sure `productId` is being passed to the BuyNowButton component

2. **Duplicate notifications**: The system prevents duplicates, so you'll get the existing notification back

3. **WhatsApp not working**: WhatsApp notifications are placeholder - you need to implement with Twilio or similar service

## Next Steps

Once basic testing is complete:
1. Set up automatic notification triggers when sellers update stock
2. Implement WhatsApp notifications with Twilio
3. Add notification management in user account settings
4. Add analytics to track notification effectiveness
