// app/(dashboard)/mis/dashboard/page.tsx
'use client';

import { useAuthGuard } from '@/app/api/auth/authGuard';
import MisDashboardContent from '@/components/mis/dashboard/dashboard-content';

export default function MISDashboardPage() {
  useAuthGuard('mis');
  return <MisDashboardContent />;
}