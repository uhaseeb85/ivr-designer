"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

const BranchNode = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-purple-100 border-2 border-purple-300 min-w-[150px]">
      <div className="flex flex-col">
        <div className="text-lg font-bold text-gray-800">{data.label}</div>
        {data.prompt && (
          <div className="text-xs text-gray-600 mt-1">{data.prompt}</div>
        )}
        <div className="text-xs bg-purple-200 px-2 py-1 rounded-sm mt-1">
          {data.nextNodeIds?.length || 0} branches
        </div>
      </div>

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-500"
      />

      {/* Option 1 handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="option1"
        className="w-3 h-3 bg-purple-500"
        style={{ left: "25%" }}
      />

      {/* Option 2 handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="option2"
        className="w-3 h-3 bg-purple-500"
        style={{ left: "75%" }}
      />

      {/* Option 3 handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="option3"
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  );
};

export default memo(BranchNode); 