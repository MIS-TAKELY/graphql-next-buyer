# Debugging Notification Freezing Issue

## Changes Made to Fix Freezing

### 1. **Optimized Backend Resolver**

**Problem:** The resolver was loading too much data unnecessarily
- Loading all product variants with `include: { variants: true }`
- Using complex OR queries that might be slow

**Solution:**
- Use `select` instead of `include` to only fetch needed fields
- Separate variant check into its own query
- Simplified duplicate check to only check userId for logged-in users
- Added try-catch for better error handling

### 2. **Added Client-Side Logging**

Added console logs to help debug:
```typescript
console.log("Creating notification for logged-in user:", {
  productId,
  variantId,
  userId: session.user.id,
});
```

### 3. **Improved Error Handling**

- Added detailed error logging on client side
- Added timeout configuration (10 seconds)
- Added catch block for mutation errors

### 4. **Query Optimization**

- Added `fetchPolicy: "network-only"` to prevent caching issues
- Added `notifyOnNetworkStatusChange` for better loading states

## How to Debug

### Step 1: Open Browser Console

1. Open the product page with out-of-stock item
2. Open browser DevTools (F12)
3. Go to Console tab

### Step 2: Click "Notify Me"

Watch for these console logs:

```
Creating notification for logged-in user: {
  productId: "...",
  variantId: "...",
  userId: "..."
}
```

### Step 3: Check for Errors

If it freezes, look for:

**GraphQL Errors:**
```
GraphQL errors: [...]
```

**Network Errors:**
```
Network error: {...}
```

**Mutation Errors:**
```
Mutation error caught: {...}
```

### Step 4: Check Network Tab

1. Go to Network tab in DevTools
2. Filter by "graphql"
3. Look for the `createProductNotification` request
4. Check:
   - Request payload
   - Response time
   - Response data
   - Any errors

## Common Issues & Solutions

### Issue 1: Request Timeout

**Symptom:** Request takes forever, eventually times out

**Check:**
- Database connection
- Prisma query performance
- Network connectivity

**Solution:**
```bash
# Check if database is accessible
npx prisma db pull

# Regenerate Prisma client
npx prisma generate
```

### Issue 2: GraphQL Schema Mismatch

**Symptom:** Error about missing fields or types

**Solution:**
```bash
# Restart the dev server
npm run dev
```

### Issue 3: Caching Issues

**Symptom:** Old data showing up, stale state

**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check if `fetchPolicy: "network-only"` is set

### Issue 4: Database Lock

**Symptom:** Request hangs indefinitely

**Check:**
```sql
-- Check for locked queries (PostgreSQL)
SELECT * FROM pg_stat_activity 
WHERE state = 'active';
```

**Solution:**
- Restart database
- Check for long-running queries

## Testing Checklist

- [ ] Console shows "Creating notification" log
- [ ] Network request completes within 2-3 seconds
- [ ] Success toast appears
- [ ] Button changes to green "Notification Set"
- [ ] Database has new entry in `product_notifications` table
- [ ] Refresh page - button stays green

## If Still Freezing

### Check Server Logs

Look at your Next.js server console for:
```
Error creating notification: ...
```

### Check Database

```sql
-- Check if notification was created
SELECT * FROM product_notifications 
WHERE "userId" = 'your-user-id' 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- Check for any constraints or issues
SELECT * FROM product_notifications 
WHERE "productId" = 'your-product-id';
```

### Verify GraphQL Endpoint

Test the mutation directly in GraphQL Playground:

```graphql
mutation {
  createProductNotification(input: {
    productId: "your-product-id"
  }) {
    id
    productId
    userId
    isNotified
  }
}
```

## Quick Fix: Restart Everything

If all else fails:

```bash
# Stop the dev server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Regenerate Prisma client
npx prisma generate

# Restart dev server
npm run dev
```

## Contact Points

If issue persists, provide:
1. Console error logs
2. Network tab screenshot
3. Server logs
4. Database query results
5. Browser and OS information
