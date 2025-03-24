import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/reminders
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");
    
    // Query parameters for filtering
    const where: any = {
      application: {
        userId: userId,
      },
    };
    
    // Filter by application if provided
    if (applicationId) {
      where.applicationId = applicationId;
    }
    
    // Check for completed filter
    const completed = searchParams.get("completed");
    if (completed !== null) {
      where.completed = completed === "true";
    }
    
    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: {
        dueDate: "asc",
      },
      include: {
        application: {
          select: {
            company: true,
            position: true,
          },
        },
      },
    });
    
    // Transform all reminders to have reminderDate for frontend compatibility
    const transformedReminders = reminders.map(reminder => ({
      ...reminder,
      reminderDate: reminder.dueDate,
    }));
    
    return NextResponse.json(transformedReminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}

// POST /api/reminders
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    // Support both field names (reminderDate from frontend, dueDate for database)
    const description = data.description;
    const dueDate = data.reminderDate || data.dueDate; // Handle both field names
    const applicationId = data.applicationId;

    // Validate required fields
    if (!dueDate || !description || !applicationId) {
      return NextResponse.json(
        { error: "Missing required fields: description, reminderDate/dueDate, and applicationId are required" },
        { status: 400 }
      );
    }

    // Verify that the application belongs to the user
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: session.user.id as string,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found or does not belong to the user" },
        { status: 404 }
      );
    }

    // Create the reminder
    const reminder = await prisma.reminder.create({
      data: {
        description,
        dueDate: new Date(dueDate),
        applicationId,
        completed: data.completed || false,
      },
    });

    // Transform the response to match the frontend field names
    const transformedReminder = {
      ...reminder,
      reminderDate: reminder.dueDate, // Add the reminderDate field for frontend compatibility
    };

    return NextResponse.json(transformedReminder, { status: 201 });
  } catch (error) {
    console.error("Error creating reminder:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }
} 