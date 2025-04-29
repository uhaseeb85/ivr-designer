import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "framer-motion";

// Node types
type NodeType = "start" | "prompt" | "collect" | "validate" | "branch" | "end";

// Node interface
interface INode {
  id: string;
  type: NodeType;
  title: string;
  prompt?: string;
  position: number; // Sequential position in the flow
  tokenId?: string;
  validationRules?: any;
  nextNodeIds: string[];
  children?: INode[];
}

// Define available node types for the palette
const NODE_TYPES = [
  { type: "prompt", label: "Prompt", description: "Play a message to the user" },
  { type: "collect", label: "Collect Input", description: "Collect user input" },
  { type: "validate", label: "Validate", description: "Validate collected input" },
  { type: "branch", label: "Branch", description: "Create a decision branch" },
  { type: "end", label: "End", description: "End the call flow" },
];

// Node palette item
const NodePaletteItem = ({ type, label, description }: { type: NodeType, label: string, description: string }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "NODE",
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <motion.div
      ref={drag}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
      className={`p-4 mb-3 bg-white border rounded-lg shadow-sm cursor-grab transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center" 
             style={{ background: `linear-gradient(135deg, var(--${type === 'start' ? 'success' : type === 'end' ? 'danger' : 'primary'}-color), var(--${type === 'branch' ? 'warning' : type === 'validate' ? 'secondary' : 'accent'}-color))` }}>
          {type === 'prompt' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
          </svg>}
          {type === 'collect' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
          </svg>}
          {type === 'validate' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>}
          {type === 'branch' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>}
        </div>
        <div>
          <div className="font-medium">{label}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </div>
    </motion.div>
  );
};

// Flow node component
const FlowNode = ({ 
  node, 
  onSelect, 
  isSelected, 
  onMove, 
  canMoveUp, 
  canMoveDown,
  tokens = []
}: { 
  node: INode; 
  onSelect: (node: INode) => void; 
  isSelected: boolean;
  onMove: (direction: "up" | "down", nodeId: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  tokens?: any[];
}) => {
  const getBgColor = () => {
    switch (node.type) {
      case "start": return "bg-green-100 border-green-300";
      case "prompt": return "bg-blue-100 border-blue-300";
      case "collect": return "bg-purple-100 border-purple-300";
      case "validate": return "bg-yellow-100 border-yellow-300";
      case "branch": return "bg-orange-100 border-orange-300";
      case "end": return "bg-red-100 border-red-300";
      default: return "bg-gray-100 border-gray-300";
    }
  };

  const getIcon = () => {
    switch (node.type) {
      case "start": return "▶️";
      case "prompt": return "🔊";
      case "collect": return "📝";
      case "validate": return "✅";
      case "branch": return "🔀";
      case "end": return "⏹️";
      default: return "📄";
    }
  };

  return (
    <motion.div 
      className={`relative p-4 mb-3 border-2 rounded-md ${getBgColor()} ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={() => onSelect(node)}
    >
      <div className="absolute right-2 top-2 flex space-x-1">
        <button 
          onClick={(e) => { e.stopPropagation(); onMove("up", node.id); }}
          disabled={!canMoveUp}
          className={`p-1 rounded ${!canMoveUp ? "text-gray-400" : "hover:bg-gray-200"}`}
        >
          ⬆️
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onMove("down", node.id); }}
          disabled={!canMoveDown}
          className={`p-1 rounded ${!canMoveDown ? "text-gray-400" : "hover:bg-gray-200"}`}
        >
          ⬇️
        </button>
      </div>
      
      <div className="flex items-center mb-2">
        <span className="mr-2">{getIcon()}</span>
        <span className="font-medium">{node.title}</span>
        <span className="ml-2 text-xs text-gray-500">({node.type})</span>
      </div>
      
      {node.prompt && (
        <div className="mb-2 text-sm">
          <span className="font-medium">Prompt: </span>
          {node.prompt}
        </div>
      )}
      
      {node.tokenId && (
        <div className="mb-2 text-sm">
          <span className="font-medium">Token: </span>
          {tokens.find(t => t.id === node.tokenId)?.name || node.tokenId}
        </div>
      )}
      
      {node.type === "branch" && (
        <div className="mt-2 text-sm text-gray-600">
          <div>Multiple paths based on user input</div>
        </div>
      )}
    </motion.div>
  );
};

// Flow drop zone component
const FlowDropZone = ({ 
  nodes, 
  onAddNode, 
  onUpdateNodes, 
  selectedNode, 
  onSelectNode,
  tokens 
}: { 
  nodes: INode[]; 
  onAddNode: (type: NodeType, position: number) => void;
  onUpdateNodes: (nodes: INode[]) => void;
  selectedNode: INode | null;
  onSelectNode: (node: INode | null) => void;
  tokens: any[];
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "NODE",
    drop: (item: { type: NodeType }) => {
      onAddNode(item.type, nodes.length);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const moveNode = (direction: "up" | "down", nodeId: string) => {
    const index = nodes.findIndex(n => n.id === nodeId);
    if (index === -1) return;
    
    if (direction === "up" && index > 1) { // Can't move start node or move before it
      const newNodes = [...nodes];
      [newNodes[index], newNodes[index - 1]] = [newNodes[index - 1], newNodes[index]];
      
      // Update positions
      newNodes.forEach((node, i) => {
        node.position = i;
      });
      
      onUpdateNodes(newNodes);
    } else if (direction === "down" && index < nodes.length - 1) {
      const newNodes = [...nodes];
      [newNodes[index], newNodes[index + 1]] = [newNodes[index + 1], newNodes[index]];
      
      // Update positions
      newNodes.forEach((node, i) => {
        node.position = i;
      });
      
      onUpdateNodes(newNodes);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <motion.div 
      ref={drop} 
      animate={{ 
        boxShadow: isOver 
          ? "0 4px 12px rgba(79, 70, 229, 0.2)" 
          : "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}
      transition={{ duration: 0.2 }}
      className={`p-6 border-2 rounded-xl h-full overflow-y-auto custom-scrollbar ${
        isOver ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
      }`}
    >
      {nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-lg font-medium mb-2">Flow is empty</p>
          <p className="text-sm text-center">Drag and drop nodes from the left panel<br />to build your IVR flow</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {nodes.map((node, index) => (
              <FlowNode 
                key={node.id} 
                node={node} 
                onSelect={onSelectNode}
                isSelected={selectedNode?.id === node.id}
                onMove={moveNode}
                canMoveUp={index > 1} // Start node should always be first
                canMoveDown={index < nodes.length - 1}
                tokens={tokens}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

// Node editor form
const NodeEditor = ({ 
  node, 
  onUpdate, 
  onClose,
  tokens = [] 
}: { 
  node: INode; 
  onUpdate: (updatedNode: INode) => void; 
  onClose: () => void;
  tokens?: any[];
}) => {
  const [title, setTitle] = useState(node.title);
  const [prompt, setPrompt] = useState(node.prompt || "");
  const [tokenId, setTokenId] = useState(node.tokenId || "");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...node,
      title,
      prompt,
      tokenId: tokenId || undefined,
    });
  };

  // Determine header gradient color based on node type
  const getHeaderColor = () => {
    switch (node.type) {
      case "start": return "bg-gradient-to-r from-green-500 to-green-600";
      case "prompt": return "bg-gradient-to-r from-blue-500 to-blue-600";
      case "collect": return "bg-gradient-to-r from-purple-500 to-purple-600";
      case "validate": return "bg-gradient-to-r from-yellow-500 to-yellow-600";
      case "branch": return "bg-gradient-to-r from-orange-500 to-orange-600";
      case "end": return "bg-gradient-to-r from-red-500 to-red-600";
      default: return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
    >
      <div className={`p-4 text-white ${getHeaderColor()}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit {node.type} Node</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-5">
        <div className="mb-4">
          <label className="form-label">
            Node Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="form-label">
            Prompt/Message
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="form-input"
            rows={3}
            placeholder={`Enter the ${node.type === 'prompt' ? 'message to play' : node.type === 'collect' ? 'collection instructions' : 'content'} for this node...`}
          />
        </div>
        
        {(node.type === "collect" || node.type === "validate") && (
          <div className="mb-4">
            <label className="form-label">
              Token
            </label>
            <select
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="form-select"
            >
              <option value="">None</option>
              {tokens.map((token) => (
                <option key={token.id} value={token.id}>
                  {token.name} ({token.type})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {node.type === "collect" 
                ? "Select a token to collect from the user"
                : "Select a token to validate against"}
            </p>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline btn-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary btn-md"
          >
            Save Changes
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// Generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// Main SimpleFlowDesigner component
export default function SimpleFlowDesigner({ 
  flowId, 
  projectId, 
  initialNodes = [],
  onSave,
  tokens = []
}: { 
  flowId: string; 
  projectId: string;
  initialNodes?: INode[];
  onSave?: (nodes: INode[]) => Promise<void>;
  tokens?: any[];
}) {
  const [nodes, setNodes] = useState<INode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<INode | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Initialize with start node if empty
  useEffect(() => {
    if (initialNodes.length === 0) {
      setNodes([
        {
          id: generateId(),
          type: "start",
          title: "Start",
          prompt: "Start of the flow",
          position: 0,
          nextNodeIds: [],
        }
      ]);
    } else {
      setNodes(initialNodes);
    }
  }, [initialNodes]);
  
  // Add a new node
  const handleAddNode = (type: NodeType, position: number) => {
    const newNode: INode = {
      id: generateId(),
      type,
      title: `New ${type}`,
      prompt: "",
      position,
      nextNodeIds: [],
    };
    
    setNodes((prev) => [...prev, newNode]);
    setSelectedNode(newNode);
  };
  
  // Update a node
  const handleUpdateNode = (updatedNode: INode) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    );
    setSelectedNode(null);
  };
  
  // Delete a node
  const handleDeleteNode = (nodeId: string) => {
    // Don't allow deleting the start node
    if (nodes.find(n => n.id === nodeId)?.type === "start") {
      return;
    }
    
    setNodes((prev) => prev.filter((node) => node.id !== nodeId));
    
    // Also remove references to this node from nextNodeIds
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        nextNodeIds: node.nextNodeIds.filter((id) => id !== nodeId),
      }))
    );
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };
  
  // Save the flow
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaveSuccess(false);
    
    try {
      // Use the provided onSave callback if available
      if (onSave) {
        await onSave(nodes);
      } else {
        // Default save implementation
        const response = await fetch(`/api/flows/${flowId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nodes: nodes.map(node => ({
              id: node.id,
              type: node.type,
              title: node.title,
              prompt: node.prompt,
              position: node.position,
              tokenId: node.tokenId,
              validationRules: node.validationRules,
              nextNodeIds: node.nextNodeIds,
            })),
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to save flow");
        }
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving flow:", error);
      setError(error instanceof Error ? error.message : "Failed to save flow");
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
              <button 
                onClick={() => setError("")}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </motion.div>
          )}
          
          {saveSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Flow saved successfully!
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex-1 flex space-x-6">
          {/* Node palette */}
          <div className="w-72 p-5 bg-white border rounded-xl shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Node Types</h3>
              <p className="text-sm text-gray-600">
                Drag and drop elements to build your IVR flow
              </p>
            </div>
            
            <div className="space-y-1">
              {NODE_TYPES.map((nodeType) => (
                <NodePaletteItem 
                  key={nodeType.type} 
                  type={nodeType.type as NodeType} 
                  label={nodeType.label} 
                  description={nodeType.description} 
                />
              ))}
            </div>
          </div>
          
          {/* Flow designer area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <FlowDropZone 
                nodes={nodes} 
                onAddNode={handleAddNode}
                onUpdateNodes={setNodes}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                tokens={tokens}
              />
            </div>
            
            <motion.div 
              layout
              className="mt-5 flex justify-between"
            >
              {selectedNode && selectedNode.type !== "start" ? (
                <button
                  onClick={() => handleDeleteNode(selectedNode.id)}
                  className="btn-danger btn-md flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete Selected Node
                </button>
              ) : (
                <div></div> // Empty div to maintain flex layout
              )}
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary btn-md flex items-center"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                    </svg>
                    Save Flow
                  </>
                )}
              </button>
            </motion.div>
          </div>
          
          {/* Node editor */}
          <AnimatePresence>
            {selectedNode && (
              <div className="w-96">
                <NodeEditor 
                  node={selectedNode} 
                  onUpdate={handleUpdateNode} 
                  onClose={() => setSelectedNode(null)}
                  tokens={tokens}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DndProvider>
  );
} 