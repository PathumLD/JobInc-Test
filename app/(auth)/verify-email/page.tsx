'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const email = params.get('email') || '';
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    console.log('Verification response:', data);
    if (res.ok) {
      setMessage('Email verified! You can now log in.');
      setTimeout(() => window.location.href = '/login', 2000);
    } else {
      setMessage(data.error || 'Verification failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Check your email</h2>
      <p className="mb-4 text-center">Enter the 6-digit code sent to <b>{email}</b></p>
      <form onSubmit={handleVerify} className="space-y-4">
        <Input
          type="text"
          maxLength={6}
          value={otp}
          onChange={e => setOtp(e.target.value)}
          placeholder="Enter OTP"
          required
        />
        <Button type="submit" className="w-full">Verify</Button>
      </form>
      {message && <div className="mt-4 text-center">{message}</div>}
    </div>
  );
}