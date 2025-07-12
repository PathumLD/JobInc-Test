// components/candidate/dashboard/dashboard-content.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Bookmark, 
  Eye, 
  TrendingUp, 
  Target, 
  Calendar,
  MessageCircle,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Building2,
  MapPin,
  DollarSign
} from 'lucide-react';
import CandidateHeader from './header';
import CandidateSidebar from './sidebar';

// Helper to decode JWT (no external dependency)
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

interface DashboardStats {
  totalApplications: number;
  savedJobs: number;
  profileViews: number;
  interviewsScheduled: number;
  profileCompleteness: number;
  jobAlerts: number;
}

interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'interview' | 'offer' | 'rejected';
  location: string;
}

interface RecommendedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  matchScore: number;
  postedDate: string;
}

interface UpcomingInterview {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'in-person';
}

export default function CandidateDashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    savedJobs: 0,
    profileViews: 0,
    interviewsScheduled: 0,
    profileCompleteness: 0,
    jobAlerts: 0,
  });

  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterview[]>([]);
  const [loading, setLoading] = useState(true);
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
        totalApplications: 12,
        savedJobs: 8,
        profileViews: 45,
        interviewsScheduled: 3,
        profileCompleteness: 85,
        jobAlerts: 5,
      });

      setRecentApplications([
        {
          id: '1',
          jobTitle: 'Senior Frontend Developer',
          company: 'TechCorp Inc.',
          appliedDate: '2024-01-10',
          status: 'interview',
          location: 'Remote'
        },
        {
          id: '2',
          jobTitle: 'React Developer',
          company: 'StartupXYZ',
          appliedDate: '2024-01-08',
          status: 'reviewed',
          location: 'New York, NY'
        },
        {
          id: '3',
          jobTitle: 'Full Stack Engineer',
          company: 'DataFlow Solutions',
          appliedDate: '2024-01-05',
          status: 'pending',
          location: 'San Francisco, CA'
        }
      ]);

      setRecommendedJobs([
        {
          id: '1',
          title: 'Senior React Developer',
          company: 'InnovateTech',
          location: 'Remote',
          salary: '$80,000 - $120,000',
          type: 'Full-time',
          matchScore: 95,
          postedDate: '2024-01-12'
        },
        {
          id: '2',
          title: 'Frontend Engineer',
          company: 'GrowthCorp',
          location: 'Austin, TX',
          salary: '$75,000 - $100,000',
          type: 'Full-time',
          matchScore: 88,
          postedDate: '2024-01-11'
        },
        {
          id: '3',
          title: 'UI/UX Developer',
          company: 'DesignHub',
          location: 'Los Angeles, CA',
          salary: '$70,000 - $95,000',
          type: 'Full-time',
          matchScore: 82,
          postedDate: '2024-01-10'
        }
      ]);

      setUpcomingInterviews([
        {
          id: '1',
          jobTitle: 'Senior Frontend Developer',
          company: 'TechCorp Inc.',
          date: '2024-01-15',
          time: '10:00 AM',
          type: 'video'
        },
        {
          id: '2',
          jobTitle: 'React Developer',
          company: 'StartupXYZ',
          date: '2024-01-18',
          time: '2:00 PM',
          type: 'phone'
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
    changeType,
    color = 'blue'
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    change?: string; 
    changeType?: 'increase' | 'decrease' | 'neutral';
    color?: 'blue' | 'green' | 'purple' | 'orange';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };

    return (
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
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </Card>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interview': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'interview': return Calendar;
      case 'reviewed': return Eye;
      case 'offer': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <CandidateHeader 
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName} 
          role={role} 
          onLogout={handleLogout} 
        />
        <div className="flex flex-1">
          <CandidateSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
      <CandidateHeader 
        onMenuClick={() => setSidebarOpen(true)}
        userName={userName} 
        role={role} 
        onLogout={handleLogout} 
      />

      <div className="flex flex-1">
        <CandidateSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {userName || 'Candidate'}!
            </h1>
            <p className="text-gray-600">Here's your job search overview</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Applications"
              value={stats.totalApplications}
              icon={FileText}
              change="+2 this week"
              changeType="increase"
              color="blue"
            />
            <StatCard
              title="Saved Jobs"
              value={stats.savedJobs}
              icon={Bookmark}
              change="+3 this week"
              changeType="increase"
              color="green"
            />
            <StatCard
              title="Profile Views"
              value={stats.profileViews}
              icon={Eye}
              change="+8 this month"
              changeType="increase"
              color="purple"
            />
            <StatCard
              title="Interviews Scheduled"
              value={stats.interviewsScheduled}
              icon={Calendar}
              change="2 upcoming"
              changeType="neutral"
              color="orange"
            />
            <StatCard
              title="Profile Completeness"
              value={`${stats.profileCompleteness}%`}
              icon={Target}
              change="Almost complete!"
              changeType="increase"
              color="green"
            />
            <StatCard
              title="Job Alerts"
              value={stats.jobAlerts}
              icon={AlertCircle}
              change="Active alerts"
              changeType="neutral"
              color="blue"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Applications */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {recentApplications.map((application) => {
                  const StatusIcon = getStatusIcon(application.status);
                  return (
                    <div key={application.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <StatusIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{application.jobTitle}</p>
                        <p className="text-sm text-gray-500">{application.company}</p>
                        <p className="text-xs text-gray-400 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {application.location} • Applied {application.appliedDate}
                        </p>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Upcoming Interviews */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h2>
                <Button variant="outline" size="sm">
                  Schedule New
                </Button>
              </div>
              <div className="space-y-4">
                {upcomingInterviews.length > 0 ? (
                  upcomingInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-start space-x-3 p-3 border rounded-lg bg-blue-50">
                      <div className="flex-shrink-0">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{interview.jobTitle}</p>
                        <p className="text-sm text-gray-500">{interview.company}</p>
                        <p className="text-xs text-gray-400 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {interview.date} at {interview.time} • {interview.type}
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {interview.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming interviews</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recommended Jobs */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recommended Jobs</h2>
              <div className="flex space-x-2">
                <Input placeholder="Search jobs..." className="w-64" />
                <Button variant="outline" size="sm">
                  View All Jobs
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{job.title}</h3>
                    <Badge className="bg-green-100 text-green-800 ml-2">
                      {job.matchScore}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    {job.company}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="mr-3">{job.location}</span>
                    <DollarSign className="h-3 w-3 mr-1" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {job.type}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Bookmark className="h-3 w-3" />
                      </Button>
                      <Button size="sm">
                        Apply
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Posted {job.postedDate}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Career Progress */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Career Progress</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-700">Profile Optimization</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-700">Skills Assessment</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">3/5 Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">Career Goals</span>
                  </div>
                  <span className="text-sm font-medium text-orange-600">2/3 Set</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
                <Button className="justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Update Resume
                </Button>
                <Button className="justify-start" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Set Career Goals
                </Button>
                <Button className="justify-start" variant="outline">
                  <Award className="mr-2 h-4 w-4" />
                  Take Skills Assessment
                </Button>
                <Button className="justify-start" variant="outline">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Check Messages
                </Button>
                <Button className="justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Network with Professionals
                </Button>
                <Button className="justify-start" variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  Research Companies
                </Button>
              </div>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Your profile was viewed by TechCorp Inc.</span>
                <span className="text-gray-400">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">New job match: Senior React Developer at InnovateTech</span>
                <span className="text-gray-400">4 hours ago</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Application status updated: Interview scheduled</span>
                <span className="text-gray-400">1 day ago</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">You saved a job: Frontend Engineer at GrowthCorp</span>
                <span className="text-gray-400">2 days ago</span>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}