
# Security Remediation Plan for Dive Coder V19.5

## Overview
This plan addresses all critical security vulnerabilities found in the security scan, implementing proper authentication, fixing RLS policies, and securing the edge function.

## Phase 1: Implement User Authentication

### 1.1 Create Auth Page (`src/pages/Auth.tsx`)
- Build login/signup form with email/password
- Include proper validation using zod schema
- Handle auth state changes correctly
- Redirect authenticated users to main app

### 1.2 Create Auth Context (`src/contexts/AuthContext.tsx`)
- Manage authentication state globally
- Handle session persistence
- Provide `user`, `session`, `signIn`, `signUp`, `signOut` functions

### 1.3 Protect Routes
- Wrap main app in auth check
- Redirect unauthenticated users to `/auth`
- Show loading state while checking auth

---

## Phase 2: Fix Database Security

### 2.1 Database Migration
Update tables and RLS policies:

```sql
-- Make user_id required for conversations
ALTER TABLE conversations 
  ALTER COLUMN user_id SET NOT NULL;

-- Drop insecure policies
DROP POLICY IF EXISTS "Allow public access to conversations" ON conversations;
DROP POLICY IF EXISTS "Allow public access to messages" ON messages;

-- Conversations: Users can only access their own
CREATE POLICY "Users can access own conversations"
ON conversations FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Messages: Access through conversation ownership
CREATE POLICY "Users can access messages in own conversations"
ON messages FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

-- Workspaces: Restrict write operations
CREATE POLICY "Authenticated users can manage workspaces"
ON workspaces FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update workspaces"
ON workspaces FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete workspaces"
ON workspaces FOR DELETE TO authenticated USING (true);

-- Skills: Admin-only write access (read-only for users)
CREATE POLICY "Only admins can modify skills"
ON skills FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "Only admins can update skills"
ON skills FOR UPDATE TO authenticated USING (false);

CREATE POLICY "Only admins can delete skills"
ON skills FOR DELETE TO authenticated USING (false);
```

---

## Phase 3: Secure Edge Function

### 3.1 Update `supabase/functions/chat/index.ts`
- Validate JWT token using `getClaims()`
- Extract `user_id` from claims
- Add per-user rate limiting logic
- Log authenticated requests

```typescript
// Add authentication check
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }), 
    { status: 401, headers: corsHeaders }
  );
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  { global: { headers: { Authorization: authHeader } } }
);

const token = authHeader.replace('Bearer ', '');
const { data, error } = await supabase.auth.getClaims(token);
if (error || !data?.claims) {
  return new Response(
    JSON.stringify({ error: 'Invalid token' }), 
    { status: 401, headers: corsHeaders }
  );
}

const userId = data.claims.sub;
console.log(`Authenticated request from user: ${userId}`);
```

---

## Phase 4: Update Frontend

### 4.1 Modify `ActivityView.tsx`
- Include auth token in API calls
- Save conversations with `user_id`
- Load only user's conversations from database

### 4.2 Add User Profile Display
- Show logged-in user info in header
- Add logout button
- Display user avatar

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Auth.tsx` | CREATE | Login/signup page |
| `src/contexts/AuthContext.tsx` | CREATE | Auth state management |
| `src/App.tsx` | MODIFY | Add auth provider and protected routes |
| `supabase/functions/chat/index.ts` | MODIFY | Add JWT validation |
| `src/components/unified/ActivityView.tsx` | MODIFY | Use auth context, save user_id |
| Database migration | CREATE | Fix RLS policies |

---

## Security Checklist After Implementation

- [ ] Users must log in to access the app
- [ ] Conversations are private to each user
- [ ] Messages can only be accessed by conversation owner
- [ ] Edge function rejects unauthenticated requests
- [ ] RLS policies enforce row-level security
- [ ] Input validation on login/signup forms
- [ ] No sensitive data in console logs

---

## Technical Notes

1. **Session Management**: Uses Supabase's built-in session handling with `onAuthStateChange`
2. **Token Refresh**: Handled automatically by Supabase client
3. **RLS Bypass Prevention**: Using `auth.uid()` function which cannot be spoofed
4. **Email Confirmation**: Will be left enabled by default for security (can be disabled for testing)

## Estimated Implementation Time
- Phase 1 (Auth): ~30 minutes
- Phase 2 (Database): ~10 minutes  
- Phase 3 (Edge Function): ~15 minutes
- Phase 4 (Frontend): ~20 minutes

**Total: ~75 minutes**
