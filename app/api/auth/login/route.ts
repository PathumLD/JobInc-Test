import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user in your custom table
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if candidate has a profile (for candidates only)
    let hasProfile = false;
    let isFirstLogin = user.is_first_login || false;

    if (user.role === 'candidate') {
      const candidateProfile = await prisma.candidate.findUnique({
        where: { user_id: user.id },
        select: { user_id: true }
      });
      hasProfile = !!candidateProfile;

      // If this is first login, update the user record
      if (isFirstLogin) {
        await prisma.user.update({
          where: { id: user.id },
          data: { is_first_login: false }
        });
      }
    }

    // Create JWT
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name || user.email.split('@')[0] // Include name in token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role, 
        status: user.status,
        isFirstLogin: isFirstLogin && user.role === 'candidate',
        hasProfile: hasProfile
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}