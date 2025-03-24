import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to export applications" },
        { status: 401 }
      );
    }

    // Get applications for the user
    const applications = await prisma.application.findMany({
      where: {
        userId: (session.user as any).id,
      },
      orderBy: {
        appliedDate: "desc",
      },
      include: {
        reminders: {
          select: {
            id: true,
            reminderDate: true,
            description: true,
            completed: true,
          },
        },
      },
    });

    // Transform data for CSV export
    const csvData = applications.map((app) => {
      const remindersText = app.reminders
        .map((r) => `${r.description} (${r.reminderDate.toISOString().split("T")[0]})${r.completed ? " - Completed" : ""}`)
        .join("; ");

      return {
        Company: app.company,
        Position: app.position,
        Status: app.status,
        "Applied Date": app.appliedDate ? app.appliedDate.toISOString().split("T")[0] : "",
        "Response Date": app.responseDate ? app.responseDate.toISOString().split("T")[0] : "",
        Notes: app.notes || "",
        Reminders: remindersText,
      };
    });

    // Convert to CSV string
    const headers = Object.keys(csvData[0] || {});
    const csvString = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            // Escape quotes and wrap in quotes if contains comma
            const escaped = typeof value === "string" ? value.replace(/"/g, '""') : value;
            return typeof escaped === "string" && (escaped.includes(",") || escaped.includes('"') || escaped.includes("\n"))
              ? `"${escaped}"`
              : escaped;
          })
          .join(",")
      ),
    ].join("\n");

    // Return CSV as a downloadable file
    return new NextResponse(csvString, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="job-applications-${new Date().toISOString().split("T")[0]}.csv"`,
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