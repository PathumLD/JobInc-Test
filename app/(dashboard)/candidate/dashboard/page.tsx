'use client';

import { useAuthGuard } from '@/app/api/auth/authGuard';
import EmployeeDashboardContent from '@/components/candidate/dashboard/dashboard-content';

export default function EmployeeDashboardPage() {
  useAuthGuard();
  return <EmployeeDashboardContent />;
}