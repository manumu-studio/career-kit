/**
 * Seed script: Register Career Kit as an OAuth client in M2 Auth.
 * Run this in the M2 Auth project: npx tsx scripts/seed-career-kit-client.ts
 *
 * Prisma schema must include: redirectUris, allowedOrigins, scopes.
 * If M2 Auth has postLogoutRedirectUris, add it to the data object.
 */
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CAREER_KIT_CLIENT = {
  name: "Career Kit",
  description: "AI-powered CV optimizer for job applications",
  redirectUris: [
    "http://localhost:3000/api/auth/callback/manumustudio",
    // Add production when deployed: "https://your-domain.com/api/auth/callback/manumustudio",
  ],
  allowedOrigins: [
    "http://localhost:3000",
    // Add production when deployed: "https://your-domain.com",
  ],
  scopes: ["openid", "email", "profile"],
  // If M2 Auth schema supports post-logout redirects (fixes federated signout 400):
  // postLogoutRedirectUris: ["http://localhost:3000", "https://your-domain.com"],
};

async function main() {
  const clientSecret = crypto.randomBytes(32).toString("base64url");
  const clientSecretHash = crypto
    .createHash("sha256")
    .update(clientSecret)
    .digest("hex");

  const record = await prisma.oAuthClient.create({
    data: {
      clientId: crypto.randomUUID(),
      clientSecretHash,
      name: CAREER_KIT_CLIENT.name,
      description: CAREER_KIT_CLIENT.description,
      redirectUris: CAREER_KIT_CLIENT.redirectUris,
      allowedOrigins: CAREER_KIT_CLIENT.allowedOrigins,
      scopes: CAREER_KIT_CLIENT.scopes,
    },
    select: { clientId: true },
  });

  console.log("\n✅ OAuth client registered successfully!\n");
  console.log("Add these to Career Kit frontend/.env.local:");
  console.log("─".repeat(50));
  console.log(`AUTH_CLIENT_ID=${record.clientId}`);
  console.log(`AUTH_CLIENT_SECRET=${clientSecret}`);
  console.log("─".repeat(50));
  console.log("\n⚠️  Save the secret now — it cannot be retrieved later.\n");
}

main()
  .catch((error) => {
    console.error("❌ Failed to create OAuth client:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
