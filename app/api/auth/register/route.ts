import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, confirmPassword } = body;

  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const requireVerification =
    process.env.REQUIRE_EMAIL_VERIFICATION === "true";

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      ...(!requireVerification && { emailVerified: new Date() }),
    },
  });

  if (requireVerification) {
    const token = await generateVerificationToken(email);
    await sendVerificationEmail(email, token);
  }

  return NextResponse.json(
    {
      success: true,
      requireVerification,
      user: { id: user.id, name: user.name, email: user.email },
    },
    { status: 201 }
  );
}
