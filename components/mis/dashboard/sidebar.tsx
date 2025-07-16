// components/mis/dashboard/sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  BarChart3, 
  Settings, 
  Shield, 
  UserCheck,
  FileText,
  AlertTriangle,
  Database
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/mis/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and statistics'
  },
  {
    name: 'User Management',
    href: '/mis/users',
    icon: Users,
    description: 'Manage candidates and employers',
    submenu: [
      { name: 'All Users', href: '/mis/users' },
      { name: 'Candidates', href: '/mis/candidates' },
      { name: 'Employers', href: '/mis/employers' },
      { name: 'Pending Verifications', href: '/mis/users/pending' }
    ]
  },
  {
    name: 'Companies',
    href: '/mis/companies',
    icon: Building2,
    description: 'Company registrations and profiles'
  },
  {
    name: 'Job Management',
    href: '/mis/jobs/jobs',
    icon: Briefcase,
    description: 'Monitor and manage job postings',
    submenu: [
      { name: 'Create Job', href: '/mis/jobs/create' },
      { name: 'All Jobs', href: '/mis/jobs/jobs' },
      { name: 'Active Jobs', href: '/mis/jobs/active' },
      { name: 'Pending Approval', href: '/mis/jobs/pending' },
      { name: 'Expired Jobs', href: '/mis/jobs/expired' }
    ]
  },
  {
    name: 'Analytics',
    href: '/mis/analytics',
    icon: BarChart3,
    description: 'Reports and insights',
    submenu: [
      { name: 'User Analytics', href: '/mis/analytics/users' },
      { name: 'Job Analytics', href: '/mis/analytics/jobs' },
      { name: 'Placement Reports', href: '/mis/analytics/placements' },
      { name: 'System Metrics', href: '/mis/analytics/system' }
    ]
  },
  {
    name: 'Verifications',
    href: '/mis/verifications',
    icon: UserCheck,
    description: 'User and company verifications'
  },
  {
    name: 'Reports',
    href: '/mis/reports',
    icon: FileText,
    description: 'Generate system reports'
  },
  {
    name: 'System Health',
    href: '/mis/system',
    icon: Database,
    description: 'Monitor system performance'
  },
  {
    name: 'Security',
    href: '/mis/security',
    icon: Shield,
    description: 'Security settings and logs'
  },
  {
    name: 'Alerts',
    href: '/mis/alerts',
    icon: AlertTriangle,
    description: 'System alerts and notifications'
  },
  {
    name: 'Settings',
    href: '/mis/settings',
    icon: Settings,
    description: 'System configuration'
  }
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
                ? 'bg-blue-100 text-blue-900'
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
                ? 'bg-blue-100 text-blue-900'
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
                    ? 'bg-blue-50 text-blue-700'
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

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900">System Status</h4>
            <p className="text-xs text-blue-700 mt-1">All systems operational</p>
            <div className="flex items-center mt-2">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-blue-700">Online</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}