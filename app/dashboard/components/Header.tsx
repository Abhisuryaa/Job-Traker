'use client';

import { signOut } from 'next-auth/react';
import { FaUserCircle } from 'react-icons/fa';

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1" />
          <div className="flex items-center">
            <div className="flex items-center">
              <button
                type="button"
                className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Open user menu</span>
                {user?.name ? (
                  <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                    {user.name[0].toUpperCase()}
                  </span>
                ) : (
                  <FaUserCircle className="h-8 w-8 text-gray-400" />
                )}
              </button>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-700">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="ml-4 px-3 py-1 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 