"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Reminder {
  id: string;
  applicationId: string;
  reminderDate: string;
  description: string;
  completed: boolean;
  application: {
    company: string;
    position: string;
  };
}

export default function RemindersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentFilter = searchParams.get("filter") || "upcoming";

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        let url = "/api/reminders";
        
        if (currentFilter === "upcoming") {
          url += "?completed=false";
        } else if (currentFilter === "completed") {
          url += "?completed=true";
        }
        
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch reminders: ${response.statusText}`);
        }

        const data = await response.json();
        setReminders(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching reminders:", err);
        setError(err.message || "Failed to fetch reminders");
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [currentFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleReminderStatus = async (id: string, completed: boolean) => {
    try {
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder) return;

      const response = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reminderDate: reminder.reminderDate,
          description: reminder.description,
          completed: !completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reminder");
      }

      const updatedReminder = await response.json();
      
      if (currentFilter !== "all") {
        // Remove from list if it doesn't match the filter anymore
        setReminders(reminders.filter((r) => r.id !== id));
      } else {
        // Update in the list
        setReminders(
          reminders.map((r) => (r.id === id ? {...updatedReminder, application: r.application} : r))
        );
      }
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

  const handleFilterChange = (filter: string) => {
    router.push(`/dashboard/reminders?filter=${filter}`);
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    // Sort by date (ascending for upcoming, descending for completed)
    const dateA = new Date(a.reminderDate).getTime();
    const dateB = new Date(b.reminderDate).getTime();
    return currentFilter === "completed" ? dateB - dateA : dateA - dateB;
  });

  const isOverdue = (date: string, completed: boolean) => {
    if (completed) return false;
    const reminderDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return reminderDate < today;
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
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Reminders
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track follow-ups and important dates for your job applications
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => handleFilterChange("upcoming")}
              className={`${
                currentFilter === "upcoming"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm focus:outline-none`}
            >
              Upcoming
            </button>
            <button
              onClick={() => handleFilterChange("completed")}
              className={`${
                currentFilter === "completed"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm focus:outline-none`}
            >
              Completed
            </button>
            <button
              onClick={() => handleFilterChange("all")}
              className={`${
                currentFilter === "all"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm focus:outline-none`}
            >
              All
            </button>
          </nav>
        </div>

        <div>
          {sortedReminders.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {sortedReminders.map((reminder) => (
                <li key={reminder.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <input
                        id={`reminder-${reminder.id}`}
                        name={`reminder-${reminder.id}`}
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={reminder.completed}
                        onChange={() =>
                          toggleReminderStatus(reminder.id, reminder.completed)
                        }
                      />
                      <div className="ml-3 flex-1">
                        <label
                          htmlFor={`reminder-${reminder.id}`}
                          className={`block text-sm font-medium ${
                            reminder.completed
                              ? "text-gray-400 line-through"
                              : isOverdue(reminder.reminderDate, reminder.completed)
                              ? "text-red-600"
                              : "text-gray-700"
                          }`}
                        >
                          {reminder.description}
                        </label>
                        <div className="mt-0.5 text-sm text-gray-500 flex flex-wrap">
                          <Link
                            href={`/dashboard/applications/${reminder.applicationId}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                          >
                            {reminder.application.company} - {reminder.application.position}
                          </Link>
                          <span className={`${
                            isOverdue(reminder.reminderDate, reminder.completed)
                              ? "text-red-500 font-medium"
                              : ""
                          }`}>
                            {isOverdue(reminder.reminderDate, reminder.completed) && !reminder.completed
                              ? "Overdue: "
                              : ""}
                            {formatDate(reminder.reminderDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
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
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No reminders
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {currentFilter === "upcoming"
                  ? "You don't have any upcoming reminders."
                  : currentFilter === "completed"
                  ? "You don't have any completed reminders."
                  : "You don't have any reminders."}
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/applications"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add reminders to applications
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 