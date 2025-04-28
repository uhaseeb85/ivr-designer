"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

const ValidateNode = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-yellow-100 border-2 border-yellow-300 min-w-[150px]">
      <div className="flex flex-col">
        <div className="text-lg font-bold text-gray-800">{data.label}</div>
        {data.tokenId ? (
          <div className="text-xs bg-yellow-200 px-2 py-1 rounded mt-1">
            Token ID: {data.tokenId}
          </div>
        ) : (
          <div className="text-xs text-red-500 mt-1">No token selected</div>
        )}
        {data.validationRules && (
          <div className="text-xs text-gray-600 mt-1">
            Custom validation: Yes
          </div>
        )}
      </div>

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-yellow-500"
      />

      {/* Output handles - Success */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500"
        id="success"
      />

      {/* Output handles - Failure */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-red-500"
        id="failure"
      />
    </div>
  );
};

export default memo(ValidateNode); 