'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function useAuthGuard(requiredRole?: string) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token || isTokenExpired(token)) {
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }

        // If a specific role is required, check it
        if (requiredRole) {
          const payload = jwtDecode<JWTPayload>(token);
          
          if (payload.role !== requiredRole) {
            // Redirect to the appropriate dashboard based on actual role
            router.push(`/${payload.role}/dashboard`);
            return;
          }
        }
      } catch (error) {
        console.error('Auth guard error:', error);
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router, requiredRole]);
}

// Helper function to get user info from token
export function getUserFromToken(): JWTPayload | null {
  try {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      return null;
    }
    
    return jwtDecode<JWTPayload>(token);
  } catch {
    return null;
  }
}