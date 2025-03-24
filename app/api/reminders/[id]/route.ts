import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET /api/reminders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to view this reminder" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const reminderId = params.id;

    // Get reminder, including application details
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
      include: {
        application: {
          select: {
            id: true,
            company: true,
            position: true,
            userId: true,
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

    // Verify that the reminder's application belongs to the user
    if (reminder.application.userId !== userId) {
      return NextResponse.json(
        { error: "You do not have permission to view this reminder" },
        { status: 403 }
      );
    }

    return NextResponse.json(reminder);
  } catch (error) {
    console.error("Error fetching reminder:", error);
    return NextResponse.json(
      { error: "Error fetching reminder" },
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
        { error: "You must be signed in to update this reminder" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const reminderId = params.id;
    const data = await request.json();

    // Validate required fields
    if (!data.reminderDate || !data.description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
        { error: "You do not have permission to update this reminder" },
        { status: 403 }
      );
    }

    // Update the reminder
    const updatedReminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        reminderDate: new Date(data.reminderDate),
        description: data.description,
        completed: data.completed !== undefined ? data.completed : existingReminder.completed,
      },
    });

    return NextResponse.json(updatedReminder);
  } catch (error) {
    console.error("Error updating reminder:", error);
    return NextResponse.json(
      { error: "Error updating reminder" },
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