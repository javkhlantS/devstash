import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { validatePasswordResetToken } from "@/lib/tokens";
import {
  rateLimiters,
  getClientIp,
  rateLimitKey,
  checkRateLimit,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = await getClientIp();
  const { limited, response } = await checkRateLimit(
    rateLimiters.resetPassword,
    rateLimitKey(ip)
  );
  if (limited) return response;

  const body = await request.json();
  const { token, password, confirmPassword } = body;

  if (!token || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match" },
      { status: 400 }
    );
  }

  const record = await validatePasswordResetToken(token);

  if (!record) {
    return NextResponse.json(
      { error: "Invalid or expired reset link. Please request a new one." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.updateMany({
      where: { email: record.email },
      data: { password: hashedPassword },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ]);

  return NextResponse.json({ success: true });
}
