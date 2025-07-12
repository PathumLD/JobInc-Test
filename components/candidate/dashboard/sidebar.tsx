// components/candidate/dashboard/sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  X, 
  LayoutDashboard, 
  Search, 
  User, 
  FileText, 
  Bookmark, 
  MessageCircle, 
  Settings, 
  Target,
  TrendingUp,
  Calendar,
  Building2,
  Award,
  Bell
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/candidate/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and statistics'
  },
  {
    name: 'Job Search',
    href: '/candidate/jobs',
    icon: Search,
    description: 'Find and apply for jobs',
    submenu: [
      { name: 'Browse Jobs', href: '/candidate/jobs' },
      { name: 'Advanced Search', href: '/candidate/jobs/search' },
      { name: 'Job Alerts', href: '/candidate/jobs/alerts' },
      { name: 'Recommended Jobs', href: '/candidate/jobs/recommended' }
    ]
  },
  {
    name: 'My Profile',
    href: '/candidate/profile',
    icon: User,
    description: 'Manage your profile and resume',
    submenu: [
      { name: 'View Profile', href: '/candidate/profile/display-profile' },
      { name: 'Upload Resume', href: '/candidate/profile/resume' },
      { name: 'Skills Assessment', href: '/candidate/profile/skills' }
    ]
  },
  {
    name: 'Applications',
    href: '/candidate/applications',
    icon: FileText,
    description: 'Track your job applications',
    submenu: [
      { name: 'All Applications', href: '/candidate/applications' },
      { name: 'In Progress', href: '/candidate/applications/pending' },
      { name: 'Interviews', href: '/candidate/applications/interviews' },
      { name: 'Offers', href: '/candidate/applications/offers' }
    ]
  },
  {
    name: 'Saved Jobs',
    href: '/candidate/saved-jobs',
    icon: Bookmark,
    description: 'Your bookmarked job listings'
  },
  {
    name: 'Messages',
    href: '/candidate/messages',
    icon: MessageCircle,
    description: 'Communication with employers'
  },
  {
    name: 'Career Goals',
    href: '/candidate/career-goals',
    icon: Target,
    description: 'Set and track career objectives'
  },
  {
    name: 'Career Insights',
    href: '/candidate/insights',
    icon: TrendingUp,
    description: 'Industry trends and salary insights'
  },
  {
    name: 'Interviews',
    href: '/candidate/interviews',
    icon: Calendar,
    description: 'Schedule and manage interviews'
  },
  {
    name: 'Companies',
    href: '/candidate/companies',
    icon: Building2,
    description: 'Explore company profiles'
  },
  {
    name: 'Certifications',
    href: '/candidate/certifications',
    icon: Award,
    description: 'Manage your certifications'
  },
  {
    name: 'Notifications',
    href: '/candidate/notifications',
    icon: Bell,
    description: 'Manage notification settings'
  },
  {
    name: 'Settings',
    href: '/candidate/settings',
    icon: Settings,
    description: 'Account and privacy settings'
  }
];

export default function CandidateSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const NavItem = ({ item }: { item: typeof navigationItems[0] }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const itemIsActive = isActive(item.href);

    return (
      <div>
        {hasSubmenu ? (
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              itemIsActive
                ? 'bg-green-100 text-green-900'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.name}</span>
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        ) : (
          <Link
            href={item.href}
            onClick={onClose}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              itemIsActive
                ? 'bg-green-100 text-green-900'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        )}

        {/* Submenu */}
        {hasSubmenu && isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {item.submenu!.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                onClick={onClose}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive(subItem.href)
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {subItem.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <span className="text-lg font-semibold text-gray-900">Menu</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-green-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-green-900">Profile Completion</h4>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-green-700">
                <span>85% Complete</span>
                <span>85%</span>
              </div>
              <div className="mt-1 h-2 bg-green-200 rounded-full">
                <div className="h-2 bg-green-600 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <p className="text-xs text-green-700 mt-2">
              Complete your profile to get better job matches
            </p>
          </div>
        </div>
      </div>
    </>
  );
}