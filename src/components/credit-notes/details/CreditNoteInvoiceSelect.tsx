
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertCircle, Search } from "lucide-react";

interface CreditNoteInvoiceSelectProps {
  invoiceId: string;
  invoiceOptions: { value: string; label: string }[];
  isEditing: boolean;
  handleInvoiceSelect: (value: string) => Promise<void>;
}

const CreditNoteInvoiceSelect = ({
  invoiceId,
  invoiceOptions = [],
  isEditing,
  handleInvoiceSelect
}: CreditNoteInvoiceSelectProps) => {
  // Enhanced safety check for invoiceOptions with more detailed logging
  const safeInvoiceOptions = React.useMemo(() => {
    try {
      if (!invoiceOptions) {
        return [];
      }
      
      if (!Array.isArray(invoiceOptions)) {
        return [];
      }
      
      // Filter out invalid options and ensure each has required properties
      const filtered = invoiceOptions.filter(option => {
        if (!option) return false;
        if (typeof option !== 'object') return false;
        if (!('value' in option) || !('label' in option)) return false;
        if (option.value === undefined || option.value === null || 
            option.label === undefined || option.label === null) return false;
        return true;
      });
      
      return filtered;
    } catch (error) {
      console.error("Error processing invoice options:", error);
      return [];
    }
  }, [invoiceOptions]);

  // Add state for the search filter
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter options based on search input
  const filteredOptions = safeInvoiceOptions.filter(option => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChange = async (value: string) => {
    try {
      if (!value) return;
      
      console.log("Selected invoice ID in CreditNoteInvoiceSelect:", value);
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
      
      {safeInvoiceOptions.length > 0 ? (
        <Select
          value={invoiceId || undefined}
          onValueChange={handleChange}
          disabled={isEditing}
        >
          <SelectTrigger className="w-full" id="invoice">
            <SelectValue placeholder="Select an invoice" />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2 sticky top-0 bg-background z-10">
              <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring px-3">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invoices..."
                  className="flex h-9 w-full rounded-md border-0 bg-transparent px-0 py-1 text-sm shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <SelectItem 
                  key={option.value || `invoice-${Math.random()}`} 
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No invoices found
              </div>
            )}
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
