# 🚨 Production Cleanup Checklist

**⚠️ CRITICAL**: This file contains a checklist of all local development workarounds that MUST be removed before deploying to production.

## 🔧 Files to Modify for Production

### 1. `convex/auth.config.js`
```diff
- // Temporarily disabled for local development without webhooks
- // We'll re-enable this when we set up proper JWT integration
- export default {
-   providers: [],
- };
+ export default {
+   providers: [
+     {
+       domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
+       applicationID: "convex",
+     },
+   ],
+ };
```

### 2. `convex/users.ts`
**Remove these functions:**
- `getAllUsers` (line ~72-77) - exposes all user data
- `getUserByClerkId` (line ~80-88) - bypasses authentication

**Update `getCurrentUser`:**
```diff
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
-   // For local development without JWT, return null but don't error
-   // In production, you'd want to throw an error here
-   return null;e end
+   throw new Error("Not authenticated");
  }
  // ... rest stays the same
}
```

### 3. `convex/projects.ts`
**Remove `clerkId` parameter from:**
- `create` mutation (line ~20)
- `getUserProjects` query (line ~54)

**Remove local development fallback logic:**
```diff
- let user = await getCurrentUser(ctx);
- 
- // For local development without JWT auth
- if (!user && clerkId) {
-   user = await ctx.db
-     .query("users")
-     .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
-     .first();
- }
+ const user = await getCurrentUser(ctx);
```

### 4. `convex/jobs.ts`
**Same changes as projects.ts:**
- Remove `clerkId` parameter from `create` mutation
- Remove local development fallback logic

### 5. `app/create/page.tsx`
**Remove `clerkId` from Convex calls:**
```diff
const projectId = await createProject({
  title: `${businessName} Brochure`,
  businessInfo: { /* ... */ },
  features: [ /* ... */ ],
- clerkId: user.id, // Pass Clerk ID for local development
});

const jobId = await createJob({
  projectId,
  type: "generate",
- clerkId: user.id, // Pass Clerk ID for local development
});
```

### 6. `app/dashboard/page.tsx`
**Remove `clerkId` from query:**
```diff
- const projects = useQuery(api.projects.getUserProjects, 
-   user ? { clerkId: user.id } : "skip"
- ) || []
+ const projects = useQuery(api.projects.getUserProjects) || []
```

### 7. `app/test-integration/page.tsx`
**🗑️ DELETE THIS ENTIRE FILE** - it's only for local development testing

### 8. `convex/jobSimulator.ts`
**🗑️ DELETE THIS ENTIRE FILE** - it's only for local development testing
- Contains mock job progress simulation
- Creates fake render records with mock data
- Replace with real FastAPI job processing

## 🔒 Production Setup Required

### Environment Variables
Add to production environment:
```bash
# Clerk JWT Configuration
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# All existing variables from .env.local
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_your_key
CLERK_SECRET_KEY=sk_your_key
```

### Clerk Dashboard Configuration
1. **JWT Template**: Create "Convex" template with proper issuer
2. **Webhooks**: Configure for production URL
   - `https://yourdomain.com/api/clerk/webhook`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`

### Security Checklist
- [ ] All debug functions removed
- [ ] All `clerkId` parameters removed
- [ ] JWT authentication enabled
- [ ] Webhooks configured for production URL
- [ ] All environment variables set in production
- [ ] Error messages don't expose sensitive information
- [ ] Rate limiting implemented on all endpoints
- [ ] HTTPS enforced (no HTTP in production)

## 🧪 Testing Production Setup

Before going live, test:
1. User sign-up creates user in Convex via webhook
2. User sign-in works without manual sync
3. Project creation works with JWT authentication
4. File uploads work with proper authentication
5. Dashboard shows projects for authenticated users only

## 📝 Notes

- Keep this file until production deployment is complete
- Delete this file after successful production deployment
- All changes are backward compatible - you can switch back to local dev mode if needed
