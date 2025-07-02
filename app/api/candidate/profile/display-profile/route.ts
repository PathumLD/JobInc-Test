import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  console.log('=== Display Profile API Called ===');
  
  try {
    // Validate token and get userId
    const userId = await validateToken(request);
    
    if (!userId) {
      console.log('Token validation failed - no userId returned');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('Token validated successfully, userId:', userId);

    // Query database with retry logic for the prepared statement error
    let candidate;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        console.log(`Database query attempt ${retryCount + 1}`);
        
        candidate = await prisma.candidate.findUnique({
          where: { user_id: userId },
        });
        
        console.log('Database query successful:', candidate ? 'Candidate found' : 'No candidate found');
        break; // Success, exit retry loop
        
      } catch (dbError: any) {
        console.error(`Database query error (attempt ${retryCount + 1}):`, dbError);
        
        if (dbError.message.includes('prepared statement') && retryCount < maxRetries) {
          console.log('Prepared statement error detected, retrying with fresh connection...');
          
          // Disconnect and reconnect
          await prisma.$disconnect();
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
          
          retryCount++;
          continue;
        } else {
          // If it's not a prepared statement error or we've exceeded retries, throw the error
          throw dbError;
        }
      }
    }

    return NextResponse.json({
      success: true,
      candidate: candidate || null,
    });

  } catch (error: any) {
    console.error('API Error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Database constraint violation' },
        { status: 400 }
      );
    } else if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}