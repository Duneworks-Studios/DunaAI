# Quick Fix: Add SUPABASE_SERVICE_ROLE_KEY to Netlify

## ⚡ 3 Simple Steps (Takes 2 minutes)

### Step 1: Get Your Service Role Key
1. Open: https://app.supabase.com
2. Click your project
3. Click **Settings** (⚙️ icon on left)
4. Click **API**
5. Find **service_role** key
6. Click the 👁️ eye icon to show it
7. **Copy the entire key** (it's long, starts with `eyJ...`)

### Step 2: Add to Netlify
1. Open: https://app.netlify.com
2. Click your site
3. Click **Site settings** (top right)
4. Click **Environment variables** (left sidebar)
5. Click **Add a variable** button
6. **Key:** `SUPABASE_SERVICE_ROLE_KEY`
7. **Value:** (paste the key you copied)
8. Click **Save**

### Step 3: Redeploy
1. Click **Deploys** tab (top)
2. Click **Trigger deploy** → **Deploy site**
3. Wait 1-2 minutes for it to finish

## ✅ Done!

After redeployment, the codes will work:
- Type `IzEgQWkgRHVuZXdvcmtzIDY3` → Gets Pro
- Type `RHVuZXdvcmtzIElzICMxIERldiBTZXJ2ZXI=` → Resets messages

That's it! No complicated setup needed.

