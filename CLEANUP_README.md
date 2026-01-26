# Unverified Email Cleanup System

This system automatically removes user accounts with unverified emails after 1 hour of registration.

## How It Works

1. **Automatic Cleanup**: A cron job runs every hour to check for users who:
   - Have `emailVerified = false`
   - Were created more than 1 hour ago

2. **Deletion**: These users are automatically deleted from the database, including all their related data (handled by Prisma's cascade deletes).

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
CRON_SECRET=your-secure-random-token-here
```

**Important**: Change this to a secure random token in production. You can generate one using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Vercel Deployment

The cron job is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-unverified-users",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs every hour. Modify the schedule as needed using cron syntax.

### Alternative: External Cron Service

If not using Vercel, you can use external cron services like:

- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)

Configure them to call:

```
GET https://your-domain.com/api/cron/cleanup-unverified-users
Authorization: Bearer YOUR_CRON_SECRET
```

## Manual Testing

### Test the Endpoint Locally

```bash
# Make sure CRON_SECRET is set in .env
curl -X GET http://localhost:3000/api/cron/cleanup-unverified-users \
  -H "Authorization: Bearer your-cron-secret-here"
```

### Create Test User

To test the cleanup, you can create a test user with unverified email and manually set the `createdAt` to be older than 1 hour using Prisma Studio or SQL.

## Monitoring

The cleanup job logs:

- Number of users deleted
- Email addresses and creation dates of deleted users
- Any errors encountered

Check your deployment logs (Vercel logs, server logs, etc.) to monitor cleanup operations.

## Database Query

To manually check unverified users:

```sql
SELECT id, email, emailVerified, createdAt 
FROM "user" 
WHERE "emailVerified" = false 
AND "createdAt" < NOW() - INTERVAL '1 hour';
```

## Security

- The endpoint is protected with a secret token (`CRON_SECRET`)
- Only requests with the correct `Authorization: Bearer <token>` header are processed
- Unauthorized requests return a 401 error

## Customization

### Change Grace Period

To change the 1-hour grace period, modify the calculation in `/app/api/cron/cleanup-unverified-users/route.ts`:

```typescript
// Change 60 * 60 * 1000 to your desired milliseconds
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
```

### Change Cron Schedule

Modify the schedule in `vercel.json`:

- `0 * * * *` - Every hour (current)
- `0 */2 * * *` - Every 2 hours
- `0 0 * * *` - Daily at midnight
- `*/30 * * * *` - Every 30 minutes

## Troubleshooting

### Cron Job Not Running

1. Check Vercel deployment logs
2. Verify `CRON_SECRET` is set in environment variables
3. Ensure `vercel.json` is in the project root
4. Redeploy after making changes

### Users Not Being Deleted

1. Check if users actually have `emailVerified = false`
2. Verify `createdAt` timestamp is older than 1 hour
3. Check database logs for any constraint violations
4. Review Prisma schema for proper cascade delete configuration
