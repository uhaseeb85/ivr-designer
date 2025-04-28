"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  NodeTypes,
  NodeChange,
  EdgeChange,
  Connection,
  Edge,
  MarkerType,
  Node,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom node components
import StartNode from "@/components/flow/StartNode";
import PromptNode from "@/components/flow/PromptNode";
import CollectNode from "@/components/flow/CollectNode";
import ValidateNode from "@/components/flow/ValidateNode";
import BranchNode from "@/components/flow/BranchNode";
import EndNode from "@/components/flow/EndNode";

interface FlowDesignerProps {
  params: {
    projectId: string;
    flowId: string;
  };
}

// Define the node types for ReactFlow
const nodeTypes: NodeTypes = {
  start: StartNode,
  prompt: PromptNode,
  collect: CollectNode,
  validate: ValidateNode,
  branch: BranchNode,
  end: EndNode,
};

export default function FlowDesignerPage({ params }: FlowDesignerProps) {
  const { projectId, flowId } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // ReactFlow state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // UI state
  const [flowName, setFlowName] = useState("");
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load flow data
  useEffect(() => {
    if (status === "authenticated") {
      const fetchFlowData = async () => {
        try {
          // Fetch flow data
          const flowResponse = await fetch(`/api/flows/${flowId}`);
          
          if (!flowResponse.ok) {
            throw new Error("Failed to fetch flow data");
          }
          
          const flowData = await flowResponse.json();
          setFlowName(flowData.flow.name);
          
          // Convert DB nodes to ReactFlow nodes
          const flowNodes = flowData.flow.nodes.map((node: any) => ({
            id: node.id,
            type: node.type,
            data: { 
              label: node.title,
              prompt: node.prompt,
              tokenId: node.tokenId,
              validationRules: node.validationRules,
              nextNodeIds: node.nextNodeIds,
            },
            position: node.position,
          }));
          
          setNodes(flowNodes);
          
          // Create edges based on nextNodeIds
          const flowEdges: Edge[] = [];
          flowData.flow.nodes.forEach((node: any) => {
            if (node.nextNodeIds && node.nextNodeIds.length > 0) {
              node.nextNodeIds.forEach((targetId: string, index: number) => {
                flowEdges.push({
                  id: `${node.id}-${targetId}`,
                  source: node.id,
                  target: targetId,
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                  },
                  style: { stroke: "#2563eb" },
                  label: node.type === "branch" ? `Option ${index + 1}` : undefined,
                });
              });
            }
          });
          
          setEdges(flowEdges);
          
          // Fetch tokens for the project
          const tokensResponse = await fetch(`/api/tokens?projectId=${projectId}`);
          
          if (tokensResponse.ok) {
            const tokensData = await tokensResponse.json();
            setTokens(tokensData.tokens);
          }
          
        } catch (error) {
          console.error("Error loading flow:", error);
          setError("Failed to load flow data");
        } finally {
          setLoading(false);
        }
      };
      
      fetchFlowData();
    }
  }, [flowId, projectId, status]);
  
  // Node changes handler
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  // Edge changes handler
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  
  // Connect nodes handler
  const onConnect = useCallback(
    (connection: Connection) => {
      // Update the source node's nextNodeIds
      setNodes((nodes) => {
        return nodes.map(node => {
          if (node.id === connection.source) {
            const nextNodeIds = [...(node.data.nextNodeIds || []), connection.target];
            return {
              ...node,
              data: {
                ...node.data,
                nextNodeIds,
              }
            };
          }
          return node;
        });
      });
      
      setEdges((eds) => addEdge({
        ...connection,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: "#2563eb" }
      }, eds));
    },
    []
  );
  
  // Save flow handler
  const saveFlow = async () => {
    setSaving(true);
    setError("");
    
    try {
      // Convert ReactFlow nodes to DB nodes
      const dbNodes = nodes.map(node => ({
        id: node.id,
        type: node.type,
        title: node.data.label,
        prompt: node.data.prompt,
        position: node.position,
        tokenId: node.data.tokenId,
        validationRules: node.data.validationRules,
        nextNodeIds: node.data.nextNodeIds || [],
      }));
      
      const response = await fetch(`/api/flows/${flowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes: dbNodes,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save flow");
      }
      
    } catch (error) {
      console.error("Error saving flow:", error);
      setError("Failed to save flow");
    } finally {
      setSaving(false);
    }
  };
  
  // Add node handler
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);
  
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      if (!reactFlowInstance || !reactFlowWrapper.current) return;
      
      const type = event.dataTransfer.getData("application/reactflow");
      
      if (!type) return;
      
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          prompt: "",
          nextNodeIds: [],
        },
      };
      
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );
  
  // Node selection handler
  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowNodePanel(true);
  };
  
  // Display loading state
  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                  IVR Designer
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Projects
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={saveFlow}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Flow"}
              </button>
              <Link
                href={`/dashboard/projects/${projectId}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Project
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Flow Designer */}
        <div className="flex-1 flex flex-col">
          {/* Flow Info */}
          <div className="bg-white p-4 border-b">
            <h1 className="text-xl font-semibold">{flowName} - Flow Designer</h1>
            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
          
          {/* ReactFlow Canvas */}
          <div className="flex-1" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-64 bg-white border-l overflow-auto">
          <div className="p-4 border-b">
            <h2 className="font-medium text-gray-900">Node Palette</h2>
            <p className="text-sm text-gray-500">Drag nodes to the canvas</p>
          </div>
          
          <div className="p-4 space-y-3">
            <div
              className="border border-gray-300 p-2 rounded bg-green-50 cursor-move"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("application/reactflow", "prompt");
              }}
            >
              Prompt Node
            </div>
            <div
              className="border border-gray-300 p-2 rounded bg-blue-50 cursor-move"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("application/reactflow", "collect");
              }}
            >
              Collect Input Node
            </div>
            <div
              className="border border-gray-300 p-2 rounded bg-yellow-50 cursor-move"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("application/reactflow", "validate");
              }}
            >
              Validate Token Node
            </div>
            <div
              className="border border-gray-300 p-2 rounded bg-purple-50 cursor-move"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("application/reactflow", "branch");
              }}
            >
              Branch Node
            </div>
            <div
              className="border border-gray-300 p-2 rounded bg-red-50 cursor-move"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("application/reactflow", "end");
              }}
            >
              End Node
            </div>
          </div>
          
          {/* Node Properties Panel */}
          {showNodePanel && selectedNode && (
            <div className="border-t p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium text-gray-900">Node Properties</h2>
                <button
                  onClick={() => {
                    setShowNodePanel(false);
                    setSelectedNode(null);
                  }}
                  className="text-gray-500"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Node Type</label>
                  <div className="mt-1">{selectedNode.type}</div>
                </div>
                
                <div>
                  <label htmlFor="node-label" className="block text-sm font-medium text-gray-700">Label</label>
                  <input
                    id="node-label"
                    type="text"
                    value={selectedNode.data.label}
                    onChange={(e) => {
                      setNodes((nds) =>
                        nds.map((node) => {
                          if (node.id === selectedNode.id) {
                            return {
                              ...node,
                              data: {
                                ...node.data,
                                label: e.target.value,
                              },
                            };
                          }
                          return node;
                        })
                      );
                    }}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {(selectedNode.type === "prompt" || selectedNode.type === "collect") && (
                  <div>
                    <label htmlFor="node-prompt" className="block text-sm font-medium text-gray-700">Prompt</label>
                    <textarea
                      id="node-prompt"
                      value={selectedNode.data.prompt || ""}
                      onChange={(e) => {
                        setNodes((nds) =>
                          nds.map((node) => {
                            if (node.id === selectedNode.id) {
                              return {
                                ...node,
                                data: {
                                  ...node.data,
                                  prompt: e.target.value,
                                },
                              };
                            }
                            return node;
                          })
                        );
                      }}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                )}
                
                {selectedNode.type === "validate" && (
                  <div>
                    <label htmlFor="node-token" className="block text-sm font-medium text-gray-700">Token</label>
                    <select
                      id="node-token"
                      value={selectedNode.data.tokenId || ""}
                      onChange={(e) => {
                        setNodes((nds) =>
                          nds.map((node) => {
                            if (node.id === selectedNode.id) {
                              return {
                                ...node,
                                data: {
                                  ...node.data,
                                  tokenId: e.target.value,
                                },
                              };
                            }
                            return node;
                          })
                        );
                      }}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Token</option>
                      {tokens.map((token) => (
                        <option key={token.id} value={token.id}>
                          {token.name} ({token.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
                      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
                      setShowNodePanel(false);
                    }}
                    className="w-full px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Node
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 