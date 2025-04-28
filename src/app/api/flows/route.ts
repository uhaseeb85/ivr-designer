import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import db from "@/lib/db";

// Create a new flow
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const { name, description, projectId } = await request.json();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email as string;

    if (!name || !projectId) {
      return NextResponse.json(
        { error: "Name and projectId are required" },
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

    // Create a new flow with a default start node
    const flow = await db.flow.create({
      data: {
        name,
        description,
        projectId,
        nodes: {
          create: [
            {
              type: "start",
              title: "Start",
              prompt: "Start of authentication flow",
              position: { x: 250, y: 100 },
              nextNodeIds: [],
            }
          ]
        }
      },
      include: {
        nodes: true,
      },
    });

    return NextResponse.json(
      { message: "Flow created successfully", flow },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating flow:", error);
    return NextResponse.json(
      { error: "Failed to create flow" },
      { status: 500 }
    );
  }
}

// Get all flows for a project
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

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
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

    // Check if project belongs to user
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        flows: {
          include: {
            nodes: true,
          }
        },
      },
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

    return NextResponse.json({ flows: project.flows });
  } catch (error) {
    console.error("Error fetching flows:", error);
    return NextResponse.json(
      { error: "Failed to fetch flows" },
      { status: 500 }
    );
  }
} 