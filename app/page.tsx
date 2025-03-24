import React from 'react';
import Link from 'next/link';
import { FaBriefcase, FaBell, FaChartLine } from 'react-icons/fa';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container-custom py-12 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-600 mb-4">
            Job Application Tracker
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            The easiest way to manage your job search. Keep track of applications, interviews, and follow-ups all in one place.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-blue-600 mb-4">
              <FaBriefcase size={24} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Track Applications</h2>
            <p className="text-slate-600">
              Store all your job applications in one organized place. Never lose track of where you've applied.
            </p>
          </div>

          <div className="card p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-blue-600 mb-4">
              <FaBell size={24} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Set Reminders</h2>
            <p className="text-slate-600">
              Never miss a follow-up or interview deadline again. Get timely notifications for important dates.
            </p>
          </div>

          <div className="card p-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-blue-600 mb-4">
              <FaChartLine size={24} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Monitor Progress</h2>
            <p className="text-slate-600">
              See your job search activity at a glance with helpful statistics and insights.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center glass p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Ready to streamline your job search?
          </h2>
          <div className="flex justify-center gap-4">
            <Link href="/auth/login" className="btn btn-primary">
              Log In
            </Link>
            <Link href="/auth/register" className="btn btn-secondary">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-600">
          <p>© 2024 Job Application Tracker. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
} 