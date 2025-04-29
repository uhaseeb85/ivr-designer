import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import db from "@/lib/db";

// Get all tokens for the current user
export async function GET(request: Request) {
  try {
    console.log("Fetching tokens: Start");
    const session = await getServerSession();
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    console.log("ProjectId query param:", projectId);
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

    // Get user
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

    // If projectId is provided, verify user has access to this project
    if (projectId) {
      console.log("Finding project:", projectId);
      const project = await db.project.findUnique({
        where: { id: projectId },
      });
      console.log("Project found:", project ? "Yes" : "No");

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      if (project.userId !== user.id) {
        console.log("Unauthorized: Project does not belong to user");
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Get tokens for the specific project
      console.log("Finding tokens for project:", projectId);
      const tokens = await db.token.findMany({
        where: {
          projectId,
        },
      });
      console.log("Tokens found:", tokens.length);

      return NextResponse.json({ tokens });
    } else {
      // Get all projects for this user
      console.log("Finding all projects for user");
      const projects = await db.project.findMany({
        where: {
          userId: user.id,
        },
      });
      console.log("User projects found:", projects.length);
      
      // Get all tokens
      console.log("Finding all tokens");
      const allTokens = await db.token.findMany();
      console.log("Total tokens found:", allTokens.length);
      
      // Filter tokens that belong to the user's projects
      const projectIds = projects.map(project => project.id);
      console.log("Project IDs:", projectIds);
      
      const userTokens = allTokens.filter(token => 
        projectIds.includes(token.projectId)
      );
      console.log("User tokens found:", userTokens.length);
      
      // Add project information to each token
      const tokensWithProject = userTokens.map(token => {
        const project = projects.find(p => p.id === token.projectId);
        return {
          ...token,
          project: {
            id: project?.id,
            name: project?.name,
          }
        };
      });
      
      console.log("Returning tokens with project info");
      return NextResponse.json({ tokens: tokensWithProject });
    }
  } catch (error) {
    console.error("Error fetching tokens:", error);
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
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