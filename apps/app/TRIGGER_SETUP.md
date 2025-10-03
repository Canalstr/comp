# Trigger.dev Setup Guide

## Environment Variables

Add these to your `.env` file:

```bash
# Trigger.dev configuration
TRIGGER_SECRET_KEY="" # Secret key from Trigger.dev
TRIGGER_API_KEY="" # API key from Trigger.dev
# TRIGGER_API_URL="" # Only set if you are self-hosting
```

## Setup Steps

1. **Create Trigger.dev Account**
   - Go to https://cloud.trigger.dev
   - Create a new project
   - Copy your Project ID

2. **Update Configuration**
   - Replace `proj_XXXXXXXXXXXX` in `trigger.config.ts` with your actual Project ID

3. **Get API Keys**
   - In your Trigger.dev dashboard, go to Settings > API Keys
   - Copy the API Key and Secret Key
   - Add them to your `.env` file

4. **Local Development**
   ```bash
   # Terminal 1: Start Next.js app
   bun run dev
   
   # Terminal 2: Start Trigger.dev dev server
   npx trigger dev
   ```

5. **Deploy Jobs**
   ```bash
   npx trigger deploy
   ```

## Available Jobs

- `send-email-notification` - Send email notifications
- `process-integration-results` - Process integration data

## Usage Examples

```typescript
import { triggerEmailNotification } from '@/trigger/email-trigger';

// Trigger email notification
await triggerEmailNotification({
  to: 'user@example.com',
  subject: 'Welcome to Comp',
  body: '<h1>Welcome!</h1>',
});
```

## Monitoring

- View job runs in Trigger.dev dashboard
- Set up alerts for failed jobs
- Monitor performance and retry attempts
