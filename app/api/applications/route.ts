import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/applications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to view applications" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Filter by search term if provided
    if (search) {
      where.OR = [
        {
          company: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          position: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Error fetching applications" },
      { status: 500 }
    );
  }
}

// POST /api/applications
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to create an application" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      company,
      position,
      location,
      status,
      appliedDate,
      salary,
      notes,
      applicationUrl,
      contactName,
      contactEmail,
    } = body;

    if (!company || !position || !location || !status || !appliedDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new application
    const application = await prisma.application.create({
      data: {
        company,
        position,
        location,
        status,
        appliedDate: new Date(appliedDate),
        salary,
        notes,
        url: applicationUrl,
        contactName,
        contactEmail,
        userId: session.user.id,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Error creating application" },
      { status: 500 }
    );
  }
} 