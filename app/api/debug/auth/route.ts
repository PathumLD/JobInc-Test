// app/api/debug/auth/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
  [key: string]: any;
}

/**
 * Debug endpoint to check authentication token
 */
export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTH DEBUG ===');
    
    // Get the token from Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'No authorization header found',
        headers: Object.fromEntries(request.headers.entries())
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token length:', token.length);

    // Try to decode without verification first
    let rawPayload;
    try {
      rawPayload = jwtDecode(token);
      console.log('Raw JWT payload:', rawPayload);
    } catch (error) {
      console.log('Failed to decode JWT:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to decode JWT',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Try to decode with type
    let typedPayload: JWTPayload;
    try {
      typedPayload = jwtDecode<JWTPayload>(token);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to decode JWT with type',
        rawPayload,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check token expiry
    const now = Date.now();
    const tokenExpiry = typedPayload.exp * 1000;
    const isExpired = tokenExpiry < now;

    return NextResponse.json({
      success: true,
      data: {
        userId: typedPayload.userId,
        email: typedPayload.email,
        role: typedPayload.role,
        exp: typedPayload.exp,
        expiryDate: new Date(tokenExpiry).toISOString(),
        currentDate: new Date(now).toISOString(),
        isExpired,
        allClaims: typedPayload
      }
    });

  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}