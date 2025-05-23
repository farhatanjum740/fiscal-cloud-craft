
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreditNoteStatusProps {
  status: string;
  onStatusChange: (value: string) => void;
}

const CreditNoteStatus = ({
  status,
  onStatusChange
}: CreditNoteStatusProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <Select 
        value={status || "issued"} 
        onValueChange={onStatusChange}
      >
        <SelectTrigger id="status">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="issued">Issued</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CreditNoteStatus;
