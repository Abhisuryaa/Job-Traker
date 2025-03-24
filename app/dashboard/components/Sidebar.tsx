'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBriefcase, FaBell, FaChartLine, FaUser } from 'react-icons/fa';

const navItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: FaChartLine
  },
  {
    href: '/dashboard/applications',
    label: 'Applications',
    icon: FaBriefcase
  },
  {
    href: '/dashboard/reminders',
    label: 'Reminders',
    icon: FaBell
  },
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: FaUser
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Link href="/dashboard" className="text-xl font-semibold text-blue-600">
            Job Tracker
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-700' : 'text-gray-400'
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
} 