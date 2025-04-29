import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import db from "@/lib/db";

// Get a specific flow
export async function GET(
  request: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const session = await getServerSession();
    const flowId = params.flowId;

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

    // Get flow with project info and validate user access
    const flow = await db.flow.findUnique({
      where: { id: flowId },
      include: {
        nodes: true,
        project: {
          select: {
            userId: true,
            name: true,
          },
        },
      },
    });

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this flow
    if (flow.project.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ flow });
  } catch (error) {
    console.error("Error fetching flow:", error);
    return NextResponse.json(
      { error: "Failed to fetch flow" },
      { status: 500 }
    );
  }
}

// Update a flow
export async function PUT(
  request: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const session = await getServerSession();
    const flowId = params.flowId;
    const { name, description, nodes, edges } = await request.json();

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

    // Get flow with project info to validate user access
    const flow = await db.flow.findUnique({
      where: { id: flowId },
      include: {
        project: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this flow
    if (flow.project.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update flow
    const updatedData: any = {};
    
    if (name !== undefined) updatedData.name = name;
    if (description !== undefined) updatedData.description = description;
    
    // Update nodes if provided
    if (nodes) {
      // Delete existing nodes
      await db.node.deleteMany({
        where: { flowId },
      });
      
      // Create new nodes
      const newNodes = nodes.map((node: any) => ({
        id: node.id,
        type: node.type,
        title: node.title,
        prompt: node.prompt,
        position: node.position || { x: 0, y: 0 }, // Support both position objects and numeric positions
        flowId,
        tokenId: node.tokenId,
        validationRules: node.validationRules,
        nextNodeIds: node.nextNodeIds || [],
      }));
      
      for (const node of newNodes) {
        await db.node.create({
          data: node,
        });
      }
    }

    const updatedFlow = await db.flow.update({
      where: { id: flowId },
      data: updatedData,
      include: {
        nodes: true,
      },
    });

    return NextResponse.json({ flow: updatedFlow });
  } catch (error) {
    console.error("Error updating flow:", error);
    return NextResponse.json(
      { error: "Failed to update flow" },
      { status: 500 }
    );
  }
}

// Delete a flow
export async function DELETE(
  request: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const session = await getServerSession();
    const flowId = params.flowId;

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

    // Get flow with project info to validate user access
    const flow = await db.flow.findUnique({
      where: { id: flowId },
      include: {
        project: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this flow
    if (flow.project.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // First delete all nodes associated with this flow
    await db.node.deleteMany({
      where: { flowId },
    });

    // Then delete the flow
    await db.flow.delete({
      where: { id: flowId },
    });

    return NextResponse.json(
      { message: "Flow deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting flow:", error);
    return NextResponse.json(
      { error: "Failed to delete flow" },
      { status: 500 }
    );
  }
} 