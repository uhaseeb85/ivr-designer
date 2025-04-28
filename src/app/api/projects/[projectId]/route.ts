import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import db from "@/lib/db";

interface RouteParams {
  params: {
    projectId: string;
  };
}

// Get a specific project
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    const projectId = await params.projectId;

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

    // Get the project with flows and tokens
    const project = await db.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        flows: true,
        tokens: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Ensure flows and tokens are always arrays
    const responseProject = {
      ...project,
      flows: project.flows || [],
      tokens: project.tokens || []
    };

    // Check if project belongs to user
    if (project.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ project: responseProject });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// Update a project
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    const projectId = await params.projectId;
    const { name, description } = await request.json();

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

    // Get the project
    const existingProject = await db.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if project belongs to user
    if (existingProject.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update the project
    const updatedProject = await db.project.update({
      where: {
        id: projectId,
      },
      data: {
        name: name || existingProject.name,
        description: description !== undefined ? description : existingProject.description,
      },
    });

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// Delete a project
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    const projectId = await params.projectId;

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

    // Get the project
    const existingProject = await db.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if project belongs to user
    if (existingProject.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete all tokens associated with the project
    await db.token.deleteMany({
      where: { projectId },
    });

    // Delete all nodes in all flows associated with the project
    const flows = await db.flow.findMany({
      where: { projectId },
      select: { id: true },
    });

    for (const flow of flows) {
      await db.node.deleteMany({
        where: { flowId: flow.id },
      });
    }

    // Delete all flows associated with the project
    await db.flow.deleteMany({
      where: { projectId },
    });

    // Delete the project
    await db.project.delete({
      where: {
        id: projectId,
      },
    });

    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
} 