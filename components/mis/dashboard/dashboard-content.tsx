// components/mis/dashboard/dashboard-content.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  Briefcase, 
  TrendingUp, 
  UserCheck, 
  Calendar,
  AlertCircle,
  Activity
} from 'lucide-react';
import MisHeader from './header';
import MisSidebar from './sidebar';

// Helper to decode JWT (no external dependency)
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

interface DashboardStats {
  totalCandidates: number;
  totalEmployers: number;
  totalJobs: number;
  activeApplications: number;
  placementRate: number;
  pendingVerifications: number;
}

interface RecentActivity {
  id: string;
  type: 'registration' | 'job_post' | 'application' | 'placement';
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning';
}

export default function MisDashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    totalEmployers: 0,
    totalJobs: 0,
    activeApplications: 0,
    placementRate: 0,
    pendingVerifications: 0,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      setUserName(payload?.name || payload?.email || 'User');
      setRole(payload?.role || null);
    }
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      setStats({
        totalCandidates: 1250,
        totalEmployers: 89,
        totalJobs: 156,
        activeApplications: 342,
        placementRate: 78.5,
        pendingVerifications: 23,
      });

      setRecentActivities([
        {
          id: '1',
          type: 'registration',
          description: 'New employer registration: TechCorp Inc.',
          timestamp: '2 hours ago',
          status: 'pending'
        },
        {
          id: '2',
          type: 'job_post',
          description: 'New job posted: Senior Developer at DataFlow',
          timestamp: '4 hours ago',
          status: 'success'
        },
        {
          id: '3',
          type: 'application',
          description: '15 new applications received today',
          timestamp: '6 hours ago',
          status: 'success'
        },
        {
          id: '4',
          type: 'placement',
          description: 'Successful placement: John Doe at ABC Corp',
          timestamp: '1 day ago',
          status: 'success'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeType 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    change?: string; 
    changeType?: 'increase' | 'decrease' | 'neutral';
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${
              changeType === 'increase' ? 'text-green-600' : 
              changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </Card>
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration': return Users;
      case 'job_post': return Briefcase;
      case 'application': return UserCheck;
      case 'placement': return TrendingUp;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'warning': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <MisHeader userName={userName} role={role} onLogout={handleLogout} />

        <div className="flex flex-1">
          {/* Sidebar */}
          <MisSidebar typeFilter={typeFilter} setTypeFilter={setTypeFilter} />

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <MisHeader userName={userName} role={role} onLogout={handleLogout} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <MisSidebar typeFilter={typeFilter} setTypeFilter={setTypeFilter} />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">MIS Dashboard</h1>
            <p className="text-gray-600">Monitor and manage the job portal system</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Candidates"
              value={stats.totalCandidates.toLocaleString()}
              icon={Users}
              change="+12% from last month"
              changeType="increase"
            />
            <StatCard
              title="Total Employers"
              value={stats.totalEmployers}
              icon={Building2}
              change="+8% from last month"
              changeType="increase"
            />
            <StatCard
              title="Active Jobs"
              value={stats.totalJobs}
              icon={Briefcase}
              change="+15% from last month"
              changeType="increase"
            />
            <StatCard
              title="Applications"
              value={stats.activeApplications}
              icon={UserCheck}
              change="+23% from last month"
              changeType="increase"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Placement Rate"
              value={`${stats.placementRate}%`}
              icon={TrendingUp}
              change="+5.2% from last month"
              changeType="increase"
            />
            <StatCard
              title="Pending Verifications"
              value={stats.pendingVerifications}
              icon={AlertCircle}
              change="Requires attention"
              changeType="warning"
            />
            <StatCard
              title="Monthly Growth"
              value="18.3%"
              icon={Activity}
              change="Platform expansion"
              changeType="increase"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Icon className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
                <Button className="justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage User Verifications
                </Button>
                <Button className="justify-start" variant="outline">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Review Job Postings
                </Button>
                <Button className="justify-start" variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  Company Registrations
                </Button>
                <Button className="justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate Reports
                </Button>
                <Button className="justify-start" variant="outline">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  System Alerts
                </Button>
              </div>
            </Card>
          </div>

          {/* System Health Status */}
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Database: Operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Email Service: Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Storage: 78% Used</span>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}