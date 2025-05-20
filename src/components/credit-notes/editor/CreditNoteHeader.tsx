
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CreditNoteHeaderProps {
  isEditing: boolean;
  loading: boolean;
  loadingData: boolean;
  handleSave: () => void;
}

const CreditNoteHeader = ({ 
  isEditing, 
  loading, 
  loadingData,
  handleSave 
}: CreditNoteHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">
        {isEditing ? "Edit Credit Note" : "Create New Credit Note"}
      </h1>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate("/app/invoices")} 
          disabled={loading || loadingData}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={loading || loadingData}
        >
          {loading ? "Saving..." : "Save Credit Note"}
        </Button>
      </div>
    </div>
  );
};

export default CreditNoteHeader;
