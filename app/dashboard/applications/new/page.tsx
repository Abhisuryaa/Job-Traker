"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface FormData {
  company: string;
  position: string;
  location: string;
  status: 'Applied' | 'Interview' | 'Offer' | 'Rejected';
  salary?: string;
  notes?: string;
  applicationUrl?: string;
  contactName?: string;
  contactEmail?: string;
}

export default function NewApplicationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    company: '',
    position: '',
    location: '',
    status: 'Applied',
    salary: '',
    notes: '',
    applicationUrl: '',
    contactName: '',
    contactEmail: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement API call to save the application
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      router.push('/dashboard/applications');
    } catch (error) {
      console.error('Failed to create application:', error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/applications"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FaArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">New Application</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company"
                    id="company"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                    Position *
                  </label>
                  <input
                    type="text"
                    name="position"
                    id="position"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status *
                  </label>
                  <select
                    name="status"
                    id="status"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    name="salary"
                    id="salary"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g. $80,000 - $100,000"
                    value={formData.salary}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="applicationUrl" className="block text-sm font-medium text-gray-700">
                    Application URL
                  </label>
                  <input
                    type="url"
                    name="applicationUrl"
                    id="applicationUrl"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://..."
                    value={formData.applicationUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    id="contactName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.contactName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    id="contactEmail"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.contactEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Additional Notes</h2>
              <div>
                <textarea
                  name="notes"
                  id="notes"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add any additional notes about the application..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <Link
              href="/dashboard/applications"
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Application'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 