// app/api/companies/verified/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { getVerifiedCompanies } from '@/lib/db/companies';
import { CompaniesResponse } from '@/lib/types/company/company';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Get verified companies for MIS job creation
 */
export async function GET(request: NextRequest): Promise<NextResponse<CompaniesResponse>> {
  try {
    // Get the token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify and decode JWT
    let payload: JWTPayload;
    try {
      payload = jwtDecode<JWTPayload>(token);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 401 }
      );
    }

    // Check if user has MIS role
    if (payload.role !== 'mis') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. MIS role required.' },
        { status: 403 }
      );
    }

    // Fetch verified companies for reference only
    const companies = await getVerifiedCompanies();

    return NextResponse.json({
      success: true,
      data: companies,
      message: companies.length === 0 ? 'No verified companies found' : undefined
    });

  } catch (error) {
    console.error('Error fetching verified companies:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching companies.'
      },
      { status: 500 }
    );
  }
}