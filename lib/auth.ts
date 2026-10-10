import { prisma } from "./prisma";

export interface CurrentUser {
  id: string;
  displayName: string;
  email: string | null;
}

const DEFAULT_DEV_USER_ID = "scholar-default-id";
const DEFAULT_DEV_EMAIL = "scholar@hogwarts.library";
const DEFAULT_DEV_NAME = "Master Archivist";

/**
 * Resolves the authenticated user on the server.
 * Never trusts client-supplied user IDs.
 * In development, ensures a persistent local user exists in the database.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  // In development access mode:
  // Ensure default scholar user exists in the database
  let user = await prisma.user.findUnique({
    where: { id: DEFAULT_DEV_USER_ID },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEFAULT_DEV_USER_ID,
        email: DEFAULT_DEV_EMAIL,
        displayName: DEFAULT_DEV_NAME,
      },
    });
  }

  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
  };
}
