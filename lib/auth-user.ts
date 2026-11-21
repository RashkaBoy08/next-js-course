import { auth, currentUser } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";

export async function getTaskflowUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
  const db = getPrisma();
  const user = await db.user.upsert({
    where: { id: userId },
    update: { email },
    create: { id: userId, email },
    select: { id: true },
  });

  return user;
}
