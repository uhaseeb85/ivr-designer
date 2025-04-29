import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import db from "@/lib/db";

// Get all projects for the current user
export async function GET() {
  try {
    console.log("Fetching projects: Start");
    const session = await getServerSession();
    console.log("Session obtained:", session ? "Yes" : "No");

    if (!session || !session.user) {
      console.log("Unauthorized: No session or user");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email as string;
    console.log("User email:", userEmail);

    // Get user ID from email
    const user = await db.user.findUnique({
      where: { email: userEmail },
    });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get all projects for the user
    console.log("Finding projects for user ID:", user.id);
    const projects = await db.project.findMany({
      where: {
        userId: user.id,
      },
    });
    console.log("Projects found:", projects.length);
    
    // Get all flows
    const allFlows = await db.flow.findMany();
    console.log("Total flows found:", allFlows.length);
    
    // Combine projects with their flows
    const formattedProjects = projects.map(project => {
      // Find flows for this project
      const projectFlows = allFlows.filter(flow => flow.projectId === project.id) || [];
      console.log(`Found ${projectFlows.length} flows for project ${project.id}`);
      
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        flows: projectFlows.map(flow => ({
          id: flow.id,
          name: flow.name,
        })),
      };
    });

    console.log("Returning formatted projects, count:", formattedProjects.length);
    return NextResponse.json({ projects: formattedProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// Create a new project
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email as string;
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Get user ID from email
    const user = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create the project
    const project = await db.project.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: "Project created successfully", project },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
} 