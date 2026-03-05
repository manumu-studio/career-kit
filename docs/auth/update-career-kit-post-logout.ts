/**
 * One-time script: Add post-logout redirect URI to the existing Career Kit OAuth client.
 * Run this in the M2 Auth project if federated signout returns 400.
 *
 * Requires M2 Auth OAuthClient schema to have postLogoutRedirectUris (or equivalent).
 * Adapt field name to match your M2 Auth schema.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLIENT_ID = "e4d1c510-031d-4766-8b1f-a3ec7373dec6"; // Career Kit client ID

async function main() {
  const client = await prisma.oAuthClient.findUnique({
    where: { clientId: CLIENT_ID },
    select: {
      clientId: true,
      name: true,
      redirectUris: true,
      allowedOrigins: true,
      // postLogoutRedirectUris: true, // Uncomment if schema has it
    },
  });

  if (!client) {
    console.error(`❌ OAuth client ${CLIENT_ID} not found`);
    process.exit(1);
  }

  console.log(`Found client: ${client.name}`);
  console.log(`Current redirectUris: ${JSON.stringify(client.redirectUris)}`);
  console.log(`Current allowedOrigins: ${JSON.stringify(client.allowedOrigins)}`);

  const newRedirectUris = Array.from(
    new Set([
      ...client.redirectUris,
      "http://localhost:3000/api/auth/callback/manumustudio",
    ])
  );

  const newAllowedOrigins = Array.from(
    new Set([...client.allowedOrigins, "http://localhost:3000"])
  );

  await prisma.oAuthClient.update({
    where: { clientId: CLIENT_ID },
    data: {
      redirectUris: newRedirectUris,
      allowedOrigins: newAllowedOrigins,
      // If schema has postLogoutRedirectUris:
      // postLogoutRedirectUris: ["http://localhost:3000"],
    },
  });

  console.log(`\n✅ Updated successfully!`);
  console.log(`New redirectUris: ${JSON.stringify(newRedirectUris)}`);
  console.log(`New allowedOrigins: ${JSON.stringify(newAllowedOrigins)}`);
}

main()
  .catch((error) => {
    console.error("❌ Failed to update OAuth client:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
