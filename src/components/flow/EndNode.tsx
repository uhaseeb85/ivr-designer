"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

const EndNode = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-red-100 border-2 border-red-300 min-w-[150px]">
      <div className="flex flex-col">
        <div className="text-lg font-bold text-gray-800">{data.label}</div>
        {data.prompt && (
          <div className="text-xs text-gray-600 mt-1">{data.prompt}</div>
        )}
      </div>

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-red-500"
      />
    </div>
  );
};

export default memo(EndNode); 