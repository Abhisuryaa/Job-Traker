import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

// GET /api/reminders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to view reminders" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const searchParams = request.nextUrl.searchParams;
    const applicationId = searchParams.get("applicationId");
    const completed = searchParams.get("completed");

    // Build query
    const where: any = {
      application: {
        userId,
      },
    };

    if (applicationId) {
      where.applicationId = applicationId;
    }

    if (completed !== null) {
      where.completed = completed === "true";
    }

    // Get reminders, including application details
    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        application: {
          select: {
            company: true,
            position: true,
          },
        },
      },
      orderBy: {
        reminderDate: "asc",
      },
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Error fetching reminders" },
      { status: 500 }
    );
  }
}

// POST /api/reminders
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to create a reminder" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const data = await request.json();

    // Validate required fields
    if (!data.applicationId || !data.reminderDate || !data.description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify that the application belongs to the user
    const application = await prisma.application.findUnique({
      where: {
        id: data.applicationId,
        userId,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Create the reminder
    const reminder = await prisma.reminder.create({
      data: {
        applicationId: data.applicationId,
        reminderDate: new Date(data.reminderDate),
        description: data.description,
        completed: data.completed || false,
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("Error creating reminder:", error);
    return NextResponse.json(
      { error: "Error creating reminder" },
      { status: 500 }
    );
  }
} 