'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { jwtDecode } from 'jwt-decode';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('Login successful');
      localStorage.setItem('token', data.token); // You can use cookies or localStorage
      // Decode JWT to get role
      const payload = jwtDecode<{ role: string }>(data.token);
      let dashboardPath = '/dashboard';
      if (payload.role === 'candidate') dashboardPath = '/candidate/dashboard';
      else if (payload.role === 'employer') dashboardPath = '/employer/dashboard';
      else if (payload.role === 'mis') dashboardPath = '/mis/dashboard';
      else if (payload.role === 'agency') dashboardPath = '/agency/dashboard';
      setTimeout(() => {
        window.location.href = dashboardPath; // Redirect to the correct dashboard based on role
      });
      
    } else {
      setMessage(data.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit">Login</Button>
      {message && <div className="text-green-500 text-sm">{message}</div>}

      <Button
        type="button"
        variant="outline"
        onClick={() => signIn("google")}
        className="w-full mt-2"
      >
        Sign in with Google
      </Button>
    </form>
  );
}