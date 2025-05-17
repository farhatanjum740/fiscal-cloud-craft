
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

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
  // Enhanced safety check for invoiceOptions with more detailed logging
  const safeInvoiceOptions = React.useMemo(() => {
    // Log for debugging
    console.log("CreditNoteInvoiceSelect - Original invoiceOptions:", invoiceOptions);
    
    try {
      // Immediately check if it's an array and handle appropriately
      if (!invoiceOptions) {
        console.log("CreditNoteInvoiceSelect: invoiceOptions is undefined or null");
        return [];
      }
      
      if (!Array.isArray(invoiceOptions)) {
        console.log("CreditNoteInvoiceSelect: invoiceOptions is not an array:", invoiceOptions);
        // Try to convert to array if possible
        return typeof invoiceOptions === 'object' ? [invoiceOptions] : [];
      }
      
      // Filter out invalid options and ensure each has required properties
      const filtered = invoiceOptions.filter(option => {
        // Skip null/undefined items
        if (!option) {
          console.log("CreditNoteInvoiceSelect: Skipping null/undefined option");
          return false;
        }
        
        // Check if it's an object
        if (typeof option !== 'object') {
          console.log("CreditNoteInvoiceSelect: Invalid option item (not an object):", option);
          return false;
        }
        
        // Check for required properties
        if (!('value' in option) || !('label' in option)) {
          console.log("CreditNoteInvoiceSelect: Option missing required properties:", option);
          return false;
        }
        
        // Ensure values are not undefined/null
        if (option.value === undefined || option.value === null || 
            option.label === undefined || option.label === null) {
          console.log("CreditNoteInvoiceSelect: Option has undefined/null value or label:", option);
          return false;
        }
        
        return true;
      });
      
      console.log("CreditNoteInvoiceSelect - Filtered invoice options:", filtered);
      return filtered;
    } catch (error) {
      console.error("Error processing invoice options:", error);
      return [];
    }
  }, [invoiceOptions]);

  console.log("CreditNoteInvoiceSelect - Final processed invoice options:", safeInvoiceOptions);
  console.log("CreditNoteInvoiceSelect - Current invoiceId:", invoiceId);

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
  
  // Log any time the component renders to trace potential issues
  useEffect(() => {
    console.log("CreditNoteInvoiceSelect rendered with", {
      invoiceId,
      optionsCount: safeInvoiceOptions.length,
      isEditing
    });
  }, [invoiceId, safeInvoiceOptions, isEditing]);

  return (
    <div className="space-y-2">
      <Label htmlFor="invoice">Invoice Reference</Label>
      
      {safeInvoiceOptions.length > 0 ? (
        <Select
          value={invoiceId || undefined}
          onValueChange={handleChange}
          disabled={isEditing}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an invoice" />
          </SelectTrigger>
          <SelectContent>
            {safeInvoiceOptions.map(option => (
              <SelectItem 
                key={option.value || `invoice-${Math.random()}`} 
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="flex items-center p-3 border border-amber-200 bg-amber-50 rounded-md text-amber-700 text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>No invoices available. Please create an invoice first.</span>
        </div>
      )}
      
      {safeInvoiceOptions.length === 0 && !isEditing && (
        <p className="text-xs text-amber-500 mt-1">
          No invoices available. Please create an invoice first.
        </p>
      )}
    </div>
  );
};

export default CreditNoteInvoiceSelect;
