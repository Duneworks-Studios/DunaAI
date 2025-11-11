# Force Refresh User Session

## Problem
After upgrading a user in the database, the client session still has old metadata cached.

## Solution: Force Session Refresh

The user needs to refresh their session to get the updated metadata. Here are several ways to do this:

### Method 1: User Logs Out and Back In (Simplest)

1. User clicks "Logout"
2. User logs back in
3. Session is refreshed with new metadata

### Method 2: Programmatically Refresh Session

Add this to the chat page or create a refresh button:

```typescript
// Refresh user session
const refreshSession = async () => {
  const { data: { session }, error } = await supabase.auth.refreshSession()
  if (session) {
    setUser(session.user)
    loadUserPlan(session.user) // Reload plan detection
  }
}
```

### Method 3: Use Admin API + Force Refresh

After upgrading via Admin API, the user's next request will have the updated metadata, but we can force a refresh.

## Why This Happens

Supabase caches user metadata in the client session. When we update the database directly:
- Database is updated ✅
- Client session still has old data ❌
- User needs to refresh session to get new data ✅

## Best Practice

Use the Admin API endpoint (`/api/admin/upgrade-user`) which:
1. Updates user metadata via Admin API
2. Updates user_plans table
3. User's next session refresh will get the new data

After calling the Admin API, user should:
1. Log out
2. Log back in
3. Premium status will be active

