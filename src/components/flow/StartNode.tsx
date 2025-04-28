"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

const StartNode = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-green-500 text-white border-2 border-green-600 min-w-[150px]">
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          {data.prompt && (
            <div className="text-xs">{data.prompt}</div>
          )}
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-700"
      />
    </div>
  );
};

export default memo(StartNode); 