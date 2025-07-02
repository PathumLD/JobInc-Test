import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // Find user in User table
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user || user.email_verification_token !== cleanOtp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Update user: set email_verified, clear token, set status to active
    await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        email_verified: true,
        email_verification_token: null,
        status: 'active',
      },
    });

    return NextResponse.json({ message: 'Email verified' });
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}