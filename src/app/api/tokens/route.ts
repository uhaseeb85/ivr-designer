import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import db from "@/lib/db";

// Get all tokens for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email as string;

    // Get user
    const user = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // If projectId is provided, verify user has access to this project
    if (projectId) {
      const project = await db.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      if (project.userId !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Get tokens for the specific project
      const tokens = await db.token.findMany({
        where: {
          projectId,
        },
        orderBy: {
          name: "asc",
        },
      });

      return NextResponse.json({ tokens });
    } else {
      // Get all tokens for all user's projects
      const tokens = await db.token.findMany({
        where: {
          project: {
            userId: user.id,
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return NextResponse.json({ tokens });
    }
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}

// Create a new token
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const { name, type, description, format, projectId } = await request.json();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email as string;

    if (!name || !type || !projectId) {
      return NextResponse.json(
        { error: "Name, type, and projectId are required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if project exists and belongs to user
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Create token
    const token = await db.token.create({
      data: {
        name,
        type,
        description,
        format,
        projectId,
      },
    });

    return NextResponse.json(
      { message: "Token created successfully", token },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating token:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
} 