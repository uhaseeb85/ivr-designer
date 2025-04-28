import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import db from "@/lib/db";

// Get a single token
export async function GET(
  request: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
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

    // Get token with project info
    const token = await db.token.findUnique({
      where: { id: tokenId },
      include: {
        project: {
          select: {
            userId: true,
            name: true,
          },
        },
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this token's project
    if (token.project.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error fetching token:", error);
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

    // Get token with project info
    const token = await db.token.findUnique({
      where: { id: tokenId },
      include: {
        project: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this token's project
    if (token.project.userId !== user.id) {
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

    // Get token with project info
    const token = await db.token.findUnique({
      where: { id: tokenId },
      include: {
        project: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this token's project
    if (token.project.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete token
    await db.token.delete({
      where: { id: tokenId },
    });

    return NextResponse.json(
      { message: "Token deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting token:", error);
    return NextResponse.json(
      { error: "Failed to delete token" },
      { status: 500 }
    );
  }
} 