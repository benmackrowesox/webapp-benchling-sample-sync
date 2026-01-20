# Benchling Sample Sync - Setup Guide

## Overview
This guide walks you through setting up the two-way synchronization between your webapp and Benchling for metagenomics samples (EBM-prefixed IDs).

## Configuration Completed ✅
The following Benchling IDs have been configured in `src/types/sync.ts`:
- **Schema ID**: `ts_NJDS3UwU`
- **Registry ID**: `src_xro8e9rf`
- **Field IDs**:
  - Client Name: `tsf_1ItF8QUi`
  - Sample Type: `tsf_E1ktWT2b`
  - Sample Format: `tsf_stZCS21smu`
  - Sample Date: `tsf_MKDjGziQ`
  - Sample Status: `tsf_PcrOui0bQJ`

---

## Step 1: Environment Variables

Add the following to your `.env.local` file:

```bash
# Benchling API Configuration
NEXT_PRIVATE_BENCHLING_API_URL=https://api.benchling.com
NEXT_PRIVATE_BENCHLING_API_KEY=your_benchling_api_key_here

# Webhook Secret (generate a random string for security)
BENCHLING_WEBHOOK_SECRET=your_random_secret_string
```

**To get your Benchling API Key:**
1. Go to https://esox.benchling.com/settings/api
2. Create a new API key or use an existing one
3. Copy the key and paste it above (replace `your_benchling_api_key_here`)

---

## Step 2: Configure Webhook in Benchling

1. Go to https://esox.benchling.com/settings/webhooks
2. Click **Add Webhook**
3. Configure:
   - **Name**: "Webapp Sync"
   - **URL**: `https://your-webapp-domain.com/api/webhooks/benchling`
     - For local development, use a tunnel like ngrok: `https://your-ngrok-id.ngrok.io/api/webhooks/benchling`
   - **Events to send**:
     - `entity.created`
     - `entity.updated`
     - `entity.deleted`
   - **Filter (optional)**: To only trigger for metagenomics samples:
     ```
     entity.schemaId = 'ts_NJDS3UwU'
     ```
4. Save the webhook
5. Copy the **Webhook Secret** shown after creation and add it to your `.env.local` as `BENCHLING_WEBHOOK_SECRET`

---

## Step 3: Test API Connectivity

Run a quick test to verify the API connection works:

```bash
cd /Users/benmackrow/Coding/Work Coding/Webapp Development v4 - Benchling Integration
npm run dev
```

Then visit the admin samples page at:
- **URL**: `http://localhost:3000/dashboard/admin/samples`
- **Expected**: You should see the admin interface (login required)

---

## Step 4: Initial Import

On the admin samples page:
1. Click **"Import from Benchling"** button
2. This will fetch all 1046 existing EBM samples from Benchling
3. Import progress will be shown on screen
4. After import completes, samples will appear in the table

---

## Step 5: Test Bidirectional Sync

### Test Webapp → Benchling:
1. Click **"Add Sample"** button
2. Fill in sample details:
   - Sample ID: `999` (will become EBM999)
   - Client Name: Test Client
   - Sample Type: Water (Unfiltered)
   - Sample Date: Select a date
   - Status: pending
3. Click **Create Sample**
4. Verify sample appears in Benchling:
   - Go to https://esox.benchling.com/registry/src_xro8e9rf
   - Search for EBM999
   - Sample should have all fields populated

### Test Benchling → Webapp:
1. In Benchling, edit an existing sample (e.g., EBM001)
2. Change a field (e.g., status to "completed")
3. Save changes
4. Refresh the admin samples page in your webapp
5. The changes should appear within ~30 seconds (status refreshes automatically)

---

## Troubleshooting

### Webhook not working?
- Verify the webhook URL is publicly accessible (not localhost)
- Check Benchling webhook logs for delivery attempts
- Ensure webhook secret matches in both places

### Import failing?
- Check browser console for error messages
- Verify API key is correct and has read access
- Check Firestore permissions

### Sync queue building up?
- Click **"Process Sync Queue"** to manually process pending operations
- Check that Benchling API key has write permissions

---

## Sync Behavior

| Scenario | Behavior |
|----------|----------|
| Create sample in webapp | Created in both Firestore and Benchling |
| Create sample in Benchling | Synced to Firestore via webhook |
| Edit sample in webapp | Updates Benchling (queued) |
| Edit sample in Benchling | Updates Firestore (webhook) |
| Edit sample in both places | Most recent change wins |
| Delete sample in webapp | Deleted from both |
| Delete sample in Benchling | Deleted from Firestore |

---

## Files Modified

- `src/types/sync.ts` - Updated Benchling field IDs
- `src/lib/server/benchling-sync.ts` - Updated field mapping functions
- `src/lib/server/sync.ts` - Fixed sampleId extraction from entityRegistryId

---

## Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Verify all environment variables are set correctly
4. Ensure Benchling API key has proper permissions

// trigger rebuild
