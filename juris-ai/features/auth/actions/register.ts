"use server";

import { prisma } from "@/lib/prisma";

import {
  registerSchema,
  RegisterInput,
} from "../schemas/auth.schema";

import { hashPassword } from "../utils/password";

export async function registerUser(data: RegisterInput) {
  const validated = registerSchema.safeParse(data);

  if (!validated.success) {
    throw new Error("Invalid form data");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: validated.data.email,
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(
    validated.data.password
  );

  const user = await prisma.user.create({
    data: {
      name: validated.data.name,
      email: validated.data.email,
      password: hashedPassword,
    },
  });

  return {
    success: true,
    userId: user.id,
  };
}