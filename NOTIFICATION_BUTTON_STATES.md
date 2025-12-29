# Product Notification Button States

## Overview
The Buy Now button now has **three distinct states** based on product availability and user notification status.

---

## Button States

### 1. **In Stock - "Buy Now"** 🟠
**When:** Product is available in stock  
**Button Color:** Orange gradient  
**Icon:** ⚡ Zap (lightning bolt)  
**Text:** "Buy Now"  
**Action:** Proceeds to checkout

```
┌─────────────────────────────────┐
│  ⚡  Buy Now                     │  ← Orange
└─────────────────────────────────┘
```

---

### 2. **Out of Stock - "Notify Me"** 🔵
**When:** Product is out of stock AND user hasn't set notification  
**Button Color:** Blue gradient  
**Icon:** 🔔 Bell  
**Text:** "Notify Me"  
**Action:** 
- **Logged-in users:** Immediately subscribes to notifications
- **Guest users:** Opens modal to collect email/phone

```
┌─────────────────────────────────┐
│  🔔  Notify Me                  │  ← Blue
└─────────────────────────────────┘
```

---

### 3. **Out of Stock - "Notification Set"** 🟢
**When:** Product is out of stock AND user has active notification  
**Button Color:** Green gradient  
**Icon:** ✓ Check  
**Text:** "Notification Set (Click to cancel)"  
**Action:** Cancels the notification subscription

```
┌─────────────────────────────────┐
│  ✓  Notification Set            │  ← Green
│     (Click to cancel)           │
└─────────────────────────────────┘
```

---

## User Flow Examples

### Scenario 1: Logged-in User on Out-of-Stock Product

1. **Initial State:** Blue "Notify Me" button
2. **User clicks:** Immediately subscribed
3. **New State:** Green "Notification Set" button
4. **User clicks again:** Notification cancelled
5. **Back to:** Blue "Notify Me" button

### Scenario 2: Guest User on Out-of-Stock Product

1. **Initial State:** Blue "Notify Me" button
2. **User clicks:** Modal opens
3. **User enters email/phone:** Submits
4. **Result:** Success toast, modal closes
5. **Note:** Button stays blue (no login to track status)

### Scenario 3: User Gets Notified

1. **Product restocked:** Seller triggers notifications
2. **User receives:** Email/WhatsApp notification
3. **Notification marked:** `isNotified = true`
4. **Button resets:** Back to orange "Buy Now" (stock available)

---

## Technical Details

### Query: Check Notification Status
```graphql
query HasActiveNotification($productId: String!, $variantId: String) {
  hasActiveNotification(productId: $productId, variantId: $variantId)
}
```

**Returns:** `true` if user has active (unsent) notification

### Mutation: Cancel Notification
```graphql
mutation CancelProductNotification($productId: String!, $variantId: String) {
  cancelProductNotification(productId: $productId, variantId: $variantId) {
    success
    message
  }
}
```

**Action:** Deletes user's pending notification

---

## Visual States Summary

| State | Color | Icon | Text | Action |
|-------|-------|------|------|--------|
| In Stock | 🟠 Orange | ⚡ | Buy Now | Checkout |
| Need Notify | 🔵 Blue | 🔔 | Notify Me | Subscribe |
| Notified | 🟢 Green | ✓ | Notification Set | Cancel |

---

## Features

✅ **Real-time Status:** Automatically checks notification status on page load  
✅ **Toggle Functionality:** Click to subscribe, click again to cancel  
✅ **Visual Feedback:** Different colors for each state  
✅ **Loading States:** Shows "Processing..." during API calls  
✅ **Toast Notifications:** Success/error feedback for all actions  
✅ **Guest Support:** Modal for non-logged-in users  
✅ **Persistent:** Notification status persists across page reloads  

---

## Testing

### Test Notification Set State:
1. Login to your account
2. Navigate to out-of-stock product
3. Click "Notify Me" (blue button)
4. Button changes to "Notification Set" (green)
5. Refresh page - button stays green
6. Click again to cancel
7. Button changes back to "Notify Me" (blue)

### Test Guest Flow:
1. Logout
2. Navigate to out-of-stock product
3. Click "Notify Me"
4. Modal appears
5. Enter email/phone
6. Submit
7. Success toast appears
8. Button stays blue (no status tracking for guests)

---

## Benefits

1. **Clear Visual Feedback:** Users know exactly what state they're in
2. **Easy Management:** One-click to subscribe/unsubscribe
3. **No Duplicate Notifications:** System prevents multiple subscriptions
4. **Persistent State:** Status survives page refreshes
5. **Accessibility:** Clear text and icons for all states
