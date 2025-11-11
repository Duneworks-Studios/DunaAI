# Quick Guide: Disable Email Verification in Supabase

## 🎯 Goal
Allow users to sign up and immediately use their account without email verification.

## ✅ Quick Steps (2 minutes)

1. **Go to Supabase Dashboard**
   - Open: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh/auth/providers

2. **Click on "Email" Provider**

3. **Find "Confirm email" toggle**
   - Scroll down in the Email provider settings
   - Find the **"Confirm email"** section
   - **Turn it OFF** (toggle should be gray/unchecked)

4. **Click "Save"**

5. **Done!** ✅
   - Users can now sign up and immediately log in
   - No email verification required

## 🧪 Test It

1. Go to your website
2. Click "Sign Up"
3. Enter email and password
4. Click "Sign Up"
5. You should be **immediately redirected to `/chat`** ✅
6. No email verification needed!

## ⚠️ Important Notes

- Changes take effect immediately
- Existing users are not affected
- New signups will work without email verification
- Make sure to save your changes in Supabase

## 🔍 Verify Settings

After making changes, verify:
1. Go to **Authentication** → **Providers** → **Email**
2. Check that **"Confirm email"** is **OFF** (disabled)
3. If it's still ON, turn it OFF and save again

## 🐛 Troubleshooting

**Problem:** Users still need to verify email
- **Solution:** Clear browser cache, wait 1-2 minutes, try again

**Problem:** Signup doesn't create session
- **Solution:** Check Supabase logs, verify environment variables are set correctly

**Problem:** Can't find the setting
- **Solution:** Look for "Email confirmations" or "Confirm email" in Authentication → Settings

---

**That's it!** Users can now sign up and immediately start using Duna without email verification. 🚀

