import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";

const TOKEN_EXPIRY_HOURS = 24;

export async function generateVerificationToken(email: string) {
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const token = randomUUID();
  const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

export async function validateVerificationToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) return null;
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return null;
  }

  return record;
}
