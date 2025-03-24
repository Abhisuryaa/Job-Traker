import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// GET /api/applications/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to view this application" },
        { status: 401 }
      );
    }

    const applicationId = params.id;
    
    // Get application by ID
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    
    // Verify the application belongs to the user
    if (application.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: "You do not have permission to view this application" },
        { status: 403 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Error fetching application" },
      { status: 500 }
    );
  }
}

// PUT /api/applications/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to update this application" },
        { status: 401 }
      );
    }

    const applicationId = params.id;
    const data = await request.json();

    // Validate required fields
    if (!data.company || !data.position || !data.status || !data.appliedDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    
    // Verify the application belongs to the user
    if (existingApplication.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: "You do not have permission to update this application" },
        { status: 403 }
      );
    }

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        company: data.company,
        position: data.position,
        status: data.status,
        appliedDate: new Date(data.appliedDate),
        responseDate: data.responseDate ? new Date(data.responseDate) : null,
        notes: data.notes || "",
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Error updating application" },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to delete this application" },
        { status: 401 }
      );
    }

    const applicationId = params.id;
    
    // Check if the application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    
    // Verify the application belongs to the user
    if (existingApplication.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: "You do not have permission to delete this application" },
        { status: 403 }
      );
    }

    // Delete application
    await prisma.application.delete({
      where: { id: applicationId },
    });

    return NextResponse.json(
      { message: "Application deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Error deleting application" },
      { status: 500 }
    );
  }
} 