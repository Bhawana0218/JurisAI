import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireLawyer() {
  const session = await auth();

  if (
    !session ||
    !["LAWYER", "ADMIN"].includes(session.user.role)
  ) {
    throw new Error("Unauthorized");
  }

  return session;
}