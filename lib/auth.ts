// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

interface JWTPayload {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
}

// Export authOptions for NextAuth - COMPLETE CONFIGURATION
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Add your credential validation logic here
        if (credentials?.email && credentials?.password) {
          // Return user object if credentials are valid
          return {
            id: '1',
            email: credentials.email,
            name: 'User',
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
  },
};

export async function validateToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (!authHeader) {
      console.log('No authorization header found');
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('No token found after Bearer removal');
      return null;
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return null;
    }

    console.log('Attempting to verify token...');
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    console.log('Token verified successfully. UserId:', payload.userId);
    return payload.userId || null;
  } catch (err) {
    console.error('Token validation error:', err);
    if (err instanceof jwt.JsonWebTokenError) {
      console.error('JWT Error:', err.message);
    } else if (err instanceof jwt.TokenExpiredError) {
      console.error('Token expired:', err.message);
    }
    return null;
  }
}
