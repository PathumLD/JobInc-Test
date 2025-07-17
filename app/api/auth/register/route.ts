import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    // Create user directly in User table with pending verification status
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role, // must match your UserType enum (e.g., 'candidate', 'employer', etc.)
        status: 'pending_verification',
        email_verified: false,
        email_verification_token: otp,
      },
    });

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Job App" <iamartseeker@gmail.com>',
      to: email,
      subject: "Your OTP Code",
      text: `Your confirmation code is: ${otp}`,
    });

    return NextResponse.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}