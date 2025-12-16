# Deployment Guide - Render

## Prerequisites
1. GitHub account
2. Render account (free tier works)
3. Supabase project with `push_subscriptions` table

## Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Add push notification backend"
git push
```

## Step 2: Create New Web Service on Render

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `timeforyou-push-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

## Step 3: Add Environment Variables

In Render dashboard, go to **Environment** tab and add:

```
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LJgDd53EvJJusaykNdLGPJxQxJWZPB0RYPJzYU7T8diz1c

VAPID_PRIVATE_KEY=UUxESmb1qvaqWYXoW2Uqh7XRCoY0K9DdKhCPdUP6d4s

VAPID_EMAIL=mailto:williebeatsyt@gmail.com

SUPABASE_URL=https://your-project.supabase.co

SUPABASE_SERVICE_KEY=your-service-role-key-here
```

**To get your Supabase Service Key:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy **service_role** key (NOT anon key!)

## Step 4: Deploy

Click **"Create Web Service"**

Render will:
1. Clone your repo
2. Run `npm install`
3. Start `npm start`
4. Keep it running 24/7

## Step 5: Verify

Check Render logs for:
```
✅ Push Notification Sender initialized
🚀 Starting Push Notification Service...
✅ Push Notification Service is running!
```

## Troubleshooting

**"Missing environment variables"**
→ Double-check all 5 env vars are set in Render

**"Error fetching classes"**
→ Check SUPABASE_SERVICE_KEY is correct

**"Push not sending"**
→ Check frontend subscribed successfully (check browser console)

## Free Tier Limitations

Render free tier:
- Sleeps after 15 min of inactivity
- Wakes up on HTTP request

**Solution**: Use a cron service (like cron-job.org) to ping your backend every 10 minutes:
```
https://timeforyou-push-backend.onrender.com/health
```

(You'll need to add a simple health endpoint to keep it alive)
