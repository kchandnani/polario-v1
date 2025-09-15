"use client";

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function TestIntegrationPage() {
  const { user, isLoaded: userLoaded } = useUser();
  
  // Test Convex query (this will fail until we create the query, but we can see the connection)
  const userProfile = useQuery(api.users.getCurrentUserProfile);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Integration Test</h1>
      
      {/* Clerk Test */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">🔐 Clerk Authentication</h2>
        {userLoaded ? (
          user ? (
            <div className="text-green-600">
              ✅ Signed in as: {user.emailAddresses[0]?.emailAddress}
            </div>
          ) : (
            <div className="text-blue-600">
              ℹ️ Not signed in - authentication system working
            </div>
          )
        ) : (
          <div>Loading user...</div>
        )}
      </div>

      {/* Convex Test */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">🗄️ Convex Database</h2>
        {userProfile === undefined ? (
          <div className="text-blue-600">
            ℹ️ Convex connected - waiting for user data
          </div>
        ) : userProfile === null ? (
          <div className="text-orange-600">
            ⚠️ No user profile found (expected for new setup)
          </div>
        ) : (
          <div className="text-green-600">
            ✅ Convex working - user profile loaded
          </div>
        )}
      </div>

      {/* Environment Check */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">🔧 Environment Variables</h2>
        <div className="space-y-2 text-sm">
          <div>
            Convex URL: {process.env.NEXT_PUBLIC_CONVEX_URL ? 
              <span className="text-green-600">✅ Set</span> : 
              <span className="text-red-600">❌ Missing</span>
            }
          </div>
          <div>
            Clerk Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 
              <span className="text-green-600">✅ Set</span> : 
              <span className="text-red-600">❌ Missing</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
