"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBriefcase, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useSession } from 'next-auth/react';

interface ApplicationStats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  recentApplications: Application[];
}

interface Application {
  id: string;
  company: string;
  position: string;
  status: 'Interview' | 'Applied' | 'Rejected';
  appliedDate: string;
}

interface StatItem {
  name: string;
  value: string;
  icon: IconType;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

const stats: StatItem[] = [
  {
    name: 'Total Applications',
    value: '12',
    icon: FaBriefcase,
    change: '+2 this week',
    changeType: 'positive',
  },
  {
    name: 'In Progress',
    value: '4',
    icon: FaClock,
    change: '3 interviews scheduled',
    changeType: 'neutral',
  },
  {
    name: 'Successful',
    value: '2',
    icon: FaCheckCircle,
    change: '1 offer received',
    changeType: 'positive',
  },
  {
    name: 'Rejected',
    value: '6',
    icon: FaTimesCircle,
    change: 'Better luck next time',
    changeType: 'negative',
  },
];

const recentApplications: Application[] = [
  {
    company: 'Tech Corp',
    position: 'Senior Developer',
    status: 'Interview',
    date: '2024-03-20',
  },
  {
    company: 'Startup Inc',
    position: 'Full Stack Engineer',
    status: 'Applied',
    date: '2024-03-19',
  },
  {
    company: 'Big Tech Co',
    position: 'Software Engineer',
    status: 'Rejected',
    date: '2024-03-18',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    interviews: 0,
    offers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch application statistics
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/applications/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "interview":
        return "bg-yellow-100 text-yellow-800";
      case "offer":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="w-10 h-10 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {session?.user?.name || 'User'}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Total Applications</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalApplications}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Pending</h3>
          <p className="text-3xl font-bold mt-2">{stats.pending}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Interviews</h3>
          <p className="text-3xl font-bold mt-2">{stats.interviews}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Offers</h3>
          <p className="text-3xl font-bold mt-2">{stats.offers}</p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">No recent activity</p>
        </div>
      </div>
    </div>
  );
} 