
import React from "react";
import { Label } from "@/components/ui/label";
import { CommandSelect } from "@/components/ui/command-select";
import { toast } from "@/hooks/use-toast";

interface CreditNoteInvoiceSelectProps {
  invoiceId: string;
  invoiceOptions: { value: string; label: string }[];
  isEditing: boolean;
  handleInvoiceSelect: (value: string) => Promise<void>;
}

const CreditNoteInvoiceSelect = ({
  invoiceId,
  invoiceOptions = [], // Provide a default empty array
  isEditing,
  handleInvoiceSelect
}: CreditNoteInvoiceSelectProps) => {
  // Ensure invoiceOptions is always a valid array with proper error handling
  const safeInvoiceOptions = React.useMemo(() => {
    try {
      if (!invoiceOptions) {
        console.log("CreditNoteInvoiceSelect: invoiceOptions is undefined or null");
        return [];
      }
      
      if (!Array.isArray(invoiceOptions)) {
        console.log("CreditNoteInvoiceSelect: invoiceOptions is not an array", invoiceOptions);
        return [];
      }
      
      // Filter out invalid options
      return invoiceOptions.filter(option => {
        if (!option || typeof option !== 'object') {
          console.log("CreditNoteInvoiceSelect: Invalid option item", option);
          return false;
        }
        
        if (!('value' in option) || !('label' in option)) {
          console.log("CreditNoteInvoiceSelect: Option missing required properties", option);
          return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error("Error processing invoice options:", error);
      return [];
    }
  }, [invoiceOptions]);

  console.log("Invoice options for dropdown:", safeInvoiceOptions);
  console.log("Current invoiceId:", invoiceId);

  const handleChange = async (value: string) => {
    try {
      if (!value) {
        console.log("No invoice selected");
        return;
      }
      
      console.log("Selected invoice ID:", value);
      await handleInvoiceSelect(value);
    } catch (error) {
      console.error("Error changing invoice:", error);
      toast({
        title: "Error",
        description: "Failed to change invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="invoice">Invoice Reference</Label>
      <CommandSelect 
        value={invoiceId || ""}
        onValueChange={handleChange}
        options={safeInvoiceOptions}
        placeholder="Select an invoice"
        searchInputPlaceholder="Search invoices..."
        emptyMessage="No invoices available"
        disabled={isEditing}
        className="w-full"
      />
      {safeInvoiceOptions.length === 0 && !isEditing && (
        <p className="text-xs text-amber-500 mt-1">
          No invoices available. Please create an invoice first.
        </p>
      )}
    </div>
  );
};

export default CreditNoteInvoiceSelect;
