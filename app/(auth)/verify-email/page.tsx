import Link from "next/link";
import { prisma } from "@/lib/db";
import { validateVerificationToken } from "@/lib/tokens";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <VerifyCard
        title="Invalid link"
        message="No verification token provided. Please check your email for the correct link."
        success={false}
      />
    );
  }

  const record = await validateVerificationToken(token);

  if (!record) {
    return (
      <VerifyCard
        title="Link expired or invalid"
        message="This verification link has expired or is invalid. Please register again."
        success={false}
      />
    );
  }

  // Mark email as verified and delete the token
  await prisma.$transaction([
    prisma.user.updateMany({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ]);

  return (
    <VerifyCard
      title="Email verified!"
      message="Your email has been verified. You can now sign in to your account."
      success={true}
    />
  );
}

function VerifyCard({
  title,
  message,
  success,
}: {
  title: string;
  message: string;
  success: boolean;
}) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-6 text-sm text-muted-foreground">{message}</p>
        <Link
          href={success ? "/sign-in" : "/register"}
          className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          {success ? "Sign in" : "Register"}
        </Link>
      </CardContent>
    </Card>
  );
}
