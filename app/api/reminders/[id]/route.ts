import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// GET /api/reminders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const reminder = await prisma.reminder.findFirst({
      where: {
        id: params.id,
        application: {
          userId: session.user.id as string,
        },
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

    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    // Transform the response to match the frontend field names
    const transformedReminder = {
      ...reminder,
      reminderDate: reminder.dueDate, // Add the reminderDate field for frontend compatibility
    };

    return NextResponse.json(transformedReminder);
  } catch (error) {
    console.error("Error fetching reminder:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminder" },
      { status: 500 }
    );
  }
}

// PUT /api/reminders/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    // Support both field names (reminderDate from frontend, dueDate for database)
    const description = data.description;
    const dueDate = data.reminderDate || data.dueDate; // Handle both field names
    const completed = data.completed !== undefined ? data.completed : false;

    // Validate that the reminder exists and belongs to the user
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id: params.id,
        application: {
          userId: session.user.id as string,
        },
      },
      include: {
        application: true,
      },
    });

    if (!existingReminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    // Update the reminder
    const updatedReminder = await prisma.reminder.update({
      where: { id: params.id },
      data: {
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        completed,
      },
    });

    // Transform the response to match the frontend field names
    const transformedReminder = {
      ...updatedReminder,
      reminderDate: updatedReminder.dueDate, // Add the reminderDate field for frontend compatibility
    };

    return NextResponse.json(transformedReminder);
  } catch (error) {
    console.error("Error updating reminder:", error);
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 }
    );
  }
}

// DELETE /api/reminders/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to delete this reminder" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const reminderId = params.id;

    // Get the reminder with its application
    const existingReminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
      include: {
        application: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingReminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    // Verify that the reminder's application belongs to the user
    if (existingReminder.application.userId !== userId) {
      return NextResponse.json(
        { error: "You do not have permission to delete this reminder" },
        { status: 403 }
      );
    }

    // Delete the reminder
    await prisma.reminder.delete({
      where: { id: reminderId },
    });

    return NextResponse.json(
      { message: "Reminder deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return NextResponse.json(
      { error: "Error deleting reminder" },
      { status: 500 }
    );
  }
} 