import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['candidate', 'employer', 'admin', 'mis', 'recruitment_agency'], {
    required_error: 'Role is required',
    invalid_type_error: 'Invalid role',
  }),
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Verify Your Email - Job App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Job App!</h2>
        <p>Thank you for registering. To complete your registration, please use the following verification code:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          <strong>${otp}</strong>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = registerSchema.parse(body);
    const { email, password, role } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true, email_verified: true }
    });

    if (existingUser?.email_verified) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // If user exists but not verified, delete the old record
    if (existingUser && !existingUser.email_verified) {
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user with pending verification status
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userType: role,
        status: 'pending_verification',
        email_verified: false,
        email_verification_token: otp,
        email_verification_token_expires: otpExpiry,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, otp);

    return NextResponse.json({
      message: 'Verification code sent to your email',
      email,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}