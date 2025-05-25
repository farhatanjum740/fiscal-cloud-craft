
import React from "react";
import { Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CancelledIndicatorProps {
  status: string;
  reason?: string;
  cancelledAt?: string;
  className?: string;
}

const CancelledIndicator: React.FC<CancelledIndicatorProps> = ({ 
  status, 
  reason, 
  cancelledAt,
  className = ""
}) => {
  if (status !== "cancelled") {
    return null;
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Ban className="h-5 w-5 text-red-600" />
        <Badge variant="outline" className="text-red-600 border-red-300">
          CANCELLED
        </Badge>
      </div>
      
      {reason && (
        <p className="text-sm text-red-700 mb-1">
          <strong>Reason:</strong> {reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </p>
      )}
      
      {cancelledAt && (
        <p className="text-sm text-red-600">
          <strong>Cancelled on:</strong> {new Date(cancelledAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default CancelledIndicator;
