import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get all applications with their reminders
    const applications = await prisma.application.findMany({
      where: {
        userId: session.user.id as string,
      },
      include: {
        reminders: true,
      },
      orderBy: {
        appliedDate: "desc",
      },
    });
    
    // Transform the reminders to add reminderDate field for frontend compatibility
    const transformedApplications = applications.map(app => ({
      ...app,
      reminders: app.reminders.map(reminder => ({
        ...reminder,
        reminderDate: reminder.dueDate, // Add reminderDate field
      })),
    }));
    
    // Convert to CSV format
    let csv = "Company,Position,Status,Applied Date,Response Date,Location,Salary,Notes,URL\n";
    
    transformedApplications.forEach((app) => {
      const row = [
        app.company.replace(/,/g, " "),
        app.position.replace(/,/g, " "),
        app.status,
        new Date(app.appliedDate).toLocaleDateString(),
        app.responseDate ? new Date(app.responseDate).toLocaleDateString() : "",
        app.location || "",
        app.salary || "",
        app.notes ? app.notes.replace(/,/g, " ").replace(/\n/g, " ") : "",
        app.url || "",
      ];
      
      csv += row.join(",") + "\n";
    });
    
    // Return the CSV data
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=job-applications.csv",
      },
    });
  } catch (error) {
    console.error("Error exporting applications:", error);
    return NextResponse.json(
      { error: "Failed to export applications" },
      { status: 500 }
    );
  }
} 