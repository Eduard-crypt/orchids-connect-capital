import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { headers } from "next/headers"
import { db } from "@/db";
 
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {    
		enabled: true
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			// Magic link implementation - for now just log
			console.log("Magic link for", user.email, ":", url);
			// TODO: Integrate with email service (Resend, SendGrid, etc.)
		}
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
			enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
		},
		linkedin: {
			clientId: process.env.LINKEDIN_CLIENT_ID || "",
			clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
			enabled: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
		}
	},
	trustedOrigins: [
		"https://connectcapitals.com",
		"https://connectcapitals.com/dashboard",
		"http://localhost:3000",
		process.env.NEXT_PUBLIC_SITE_URL || ""
	].filter(Boolean),
	plugins: [bearer()]
});

// Session validation helper
export async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user || null;
}