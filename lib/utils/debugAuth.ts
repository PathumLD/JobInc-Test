// lib/utils/debugAuth.ts

import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
  [key: string]: any;
}

/**
 * Debug the current auth token
 */
export function debugAuthToken(): void {
  if (typeof window === 'undefined') {
    console.log('Not in browser environment');
    return;
  }

  console.log('=== CLIENT AUTH DEBUG ===');
  
  const token = localStorage.getItem('token');
  console.log('Token exists in localStorage:', !!token);
  
  if (!token) {
    console.log('❌ No token found in localStorage');
    return;
  }

  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...');

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    console.log('✅ Token decoded successfully:');
    console.log('  User ID:', decoded.userId);
    console.log('  Email:', decoded.email);
    console.log('  Role:', decoded.role);
    console.log('  Role type:', typeof decoded.role);
    console.log('  Expires:', new Date(decoded.exp * 1000).toISOString());
    console.log('  Is expired:', decoded.exp * 1000 < Date.now());
    console.log('  All claims:', decoded);
    
    // Check if role is exactly 'mis'
    if (decoded.role === 'mis') {
      console.log('✅ Role matches "mis"');
    } else {
      console.log('❌ Role does not match "mis"');
      console.log('  Expected: "mis"');
      console.log('  Actual:', `"${decoded.role}"`);
    }
    
  } catch (error) {
    console.log('❌ Failed to decode token:', error);
  }
}

/**
 * Test API call with current token
 */
export async function testAuthAPI(): Promise<void> {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token to test');
    return;
  }

  try {
    console.log('Testing auth API...');
    const response = await fetch('/api/debug/auth', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log('Auth API response:', data);
  } catch (error) {
    console.log('Auth API test failed:', error);
  }
}

// Add to window for easy debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuthToken;
  (window as any).testAuthAPI = testAuthAPI;
}