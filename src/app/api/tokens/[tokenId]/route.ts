import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import db from "@/lib/db";

// Get a single token
export async function GET(
  request: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    console.log("Fetching token:", params.tokenId);
    const session = await getServerSession();
    const tokenId = params.tokenId;

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email as string;
    console.log("User email:", userEmail);

    // Get user ID
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

    // Get token
    console.log("Finding token:", tokenId);
    const token = await db.token.findUnique({
      where: { id: tokenId },
    });
    console.log("Token found:", token ? "Yes" : "No");

    if (!token) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    // Get project details
    console.log("Finding project for token:", token.projectId);
    const project = await db.project.findUnique({
      where: { id: token.projectId },
    });
    console.log("Project found:", project ? "Yes" : "No");

    if (!project) {
      return NextResponse.json(
        { error: "Token's project not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this token's project
    if (project.userId !== user.id) {
      console.log("Unauthorized: Token's project does not belong to user");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Combine token with project info
    const tokenWithProject = {
      ...token,
      project: {
        id: project.id,
        name: project.name,
        userId: project.userId
      }
    };

    return NextResponse.json({ token: tokenWithProject });
  } catch (error) {
    console.error("Error fetching token:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch token" },
      { status: 500 }
    );
  }
}

// Update a token
export async function PUT(
  request: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    console.log("Updating token:", params.tokenId);
    const session = await getServerSession();
    const tokenId = params.tokenId;
    const { name, type, description, format } = await request.json();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email as string;

    // Get user ID
    const user = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get token
    const token = await db.token.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    // Get project to check ownership
    const project = await db.project.findUnique({
      where: { id: token.projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Token's project not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this token's project
    if (project.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update token
    const updatedToken = await db.token.update({
      where: { id: tokenId },
      data: {
        name,
        type,
        description,
        format,
      },
    });

    return NextResponse.json({ token: updatedToken });
  } catch (error) {
    console.error("Error updating token:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Failed to update token" },
      { status: 500 }
    );
  }
}

// Delete a token
export async function DELETE(
  request: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    console.log("Deleting token:", params.tokenId);
    const session = await getServerSession();
    const tokenId = params.tokenId;

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email as string;

    // Get user ID
    const user = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get token
    const token = await db.token.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    // Get project to check ownership
    const project = await db.project.findUnique({
      where: { id: token.projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Token's project not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this token's project
    if (project.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete token
    console.log("Deleting token from database");
    await db.token.delete({
      where: { id: tokenId },
    });
    console.log("Token successfully deleted");

    return NextResponse.json(
      { message: "Token deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting token:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Failed to delete token" },
      { status: 500 }
    );
  }
} 