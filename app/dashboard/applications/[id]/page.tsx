"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';

interface Application {
  id: string;
  company: string;
  position: string;
  location: string;
  status: 'Applied' | 'Interview' | 'Offer' | 'Rejected';
  date: string;
  salary?: string;
  notes?: string;
  applicationUrl?: string;
  contactName?: string;
  contactEmail?: string;
}

interface Reminder {
  id: string;
  applicationId: string;
  reminderDate: string;
  description: string;
  completed: boolean;
}

interface Props {
  params: {
    id: string;
  };
}

export default function ApplicationDetailsPage({ params }: Props) {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reminderForm, setReminderForm] = useState<{
    reminderDate: string;
    description: string;
    showForm: boolean;
  }>({
    reminderDate: new Date().toISOString().split("T")[0],
    description: "",
    showForm: false,
  });
  const [addingReminder, setAddingReminder] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/applications/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Application not found");
          }
          throw new Error(`Failed to fetch application: ${response.statusText}`);
        }

        const data = await response.json();
        setApplication(data);
        setError(null);

        // Fetch reminders
        fetchReminders();
      } catch (err: any) {
        console.error("Error fetching application:", err);
        setError(err.message || "Failed to fetch application");
      } finally {
        setLoading(false);
      }
    };

    const fetchReminders = async () => {
      try {
        const response = await fetch(`/api/reminders?applicationId=${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setReminders(data);
        }
      } catch (err) {
        console.error("Error fetching reminders:", err);
      }
    };

    fetchApplication();
  }, [params.id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/applications/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete application: ${response.statusText}`);
      }

      router.push("/dashboard/applications");
      router.refresh();
    } catch (err: any) {
      console.error("Error deleting application:", err);
      alert(err.message || "Failed to delete application");
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'Interview':
        return 'bg-blue-100 text-blue-800';
      case 'Applied':
        return 'bg-yellow-100 text-yellow-800';
      case 'Offer':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addReminder = async () => {
    if (!reminderForm.reminderDate || !reminderForm.description) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setAddingReminder(true);
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: params.id,
          reminderDate: reminderForm.reminderDate,
          description: reminderForm.description,
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add reminder");
      }

      const newReminder = await response.json();
      setReminders([...reminders, newReminder]);
      setReminderForm({
        reminderDate: new Date().toISOString().split("T")[0],
        description: "",
        showForm: false,
      });
    } catch (err: any) {
      console.error("Error adding reminder:", err);
      alert(err.message || "Failed to add reminder");
    } finally {
      setAddingReminder(false);
    }
  };

  const toggleReminderStatus = async (id: string, completed: boolean) => {
    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return;

      const response = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...reminder,
          reminderDate: reminder.reminderDate,
          description: reminder.description,
          completed: !completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reminder");
      }

      const updatedReminder = await response.json();
      setReminders(
        reminders.map((r) => (r.id === id ? updatedReminder : r))
      );
    } catch (err: any) {
      console.error("Error updating reminder:", err);
      alert(err.message || "Failed to update reminder");
    }
  };

  const deleteReminder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete reminder");
      }

      setReminders(reminders.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error("Error deleting reminder:", err);
      alert(err.message || "Failed to delete reminder");
    }
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
            <div className="mt-4">
              <Link
                href="/dashboard/applications"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Applications
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">No application found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/applications"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Application Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/applications/${params.id}/edit`}
            className="btn-secondary flex items-center gap-2"
          >
            <FaEdit className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger flex items-center gap-2"
            disabled={deleteLoading}
          >
            <FaTrash className="h-4 w-4" />
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Main Information */}
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Application Information</h2>
            <dl className="space-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.company}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Position</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.position}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.location}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {application.status}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Application Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(application.date)}</dd>
              </div>

              {application.salary && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Salary Range</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.salary}</dd>
                </div>
              )}

              {application.applicationUrl && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Application URL</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a
                      href={application.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {application.applicationUrl}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Contact Information and Notes */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Contact Information</h2>
              <dl className="space-y-6">
                {application.contactName && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{application.contactName}</dd>
                  </div>
                )}

                {application.contactEmail && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a
                        href={`mailto:${application.contactEmail}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {application.contactEmail}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Notes</h2>
              <div className="prose prose-sm max-w-none">
                {application.notes ? (
                  <p className="text-gray-900">{application.notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No notes added</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Application</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this application? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminders Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Reminders
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Set reminders for follow-ups and important dates.
            </p>
          </div>
          <button
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setReminderForm({ ...reminderForm, showForm: true })}
          >
            Add Reminder
          </button>
        </div>

        {reminderForm.showForm && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="reminderDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="reminderDate"
                    id="reminderDate"
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={reminderForm.reminderDate}
                    onChange={(e) =>
                      setReminderForm({
                        ...reminderForm,
                        reminderDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="description"
                    id="description"
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={reminderForm.description}
                    onChange={(e) =>
                      setReminderForm({
                        ...reminderForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="e.g., Follow up on interview"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                onClick={() =>
                  setReminderForm({
                    ...reminderForm,
                    showForm: false,
                  })
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={addReminder}
                disabled={addingReminder}
              >
                {addingReminder ? "Adding..." : "Add Reminder"}
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200">
          {reminders.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {reminders.map((reminder) => (
                <li key={reminder.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id={`reminder-${reminder.id}`}
                        name={`reminder-${reminder.id}`}
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={reminder.completed}
                        onChange={() => toggleReminderStatus(reminder.id, reminder.completed)}
                      />
                      <label
                        htmlFor={`reminder-${reminder.id}`}
                        className={`ml-3 block text-sm font-medium ${
                          reminder.completed ? "text-gray-400 line-through" : "text-gray-700"
                        }`}
                      >
                        {reminder.description}
                      </label>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-500 mr-4">
                        {formatDate(reminder.reminderDate)}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              No reminders yet. Add a reminder to track follow-ups.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 