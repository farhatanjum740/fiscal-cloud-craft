
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RefreshCw, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CommandSelect } from "@/components/ui/command-select";
import type { CreditNoteItem } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface CreditNoteDetailsProps {
  creditNote: {
    invoiceId: string;
    creditNoteNumber: string;
    creditNoteDate: Date;
    financialYear: string;
    reason: string;
    status: string;
  };
  setCreditNote: (value: React.SetStateAction<any>) => void;
  invoiceOptions: { value: string; label: string }[];
  isEditing: boolean;
  isGeneratingNumber: boolean;
  handleInvoiceChange: (value: string) => Promise<void>;
  generateCreditNoteNumber: () => Promise<void>;
}

const CreditNoteDetails = ({
  creditNote,
  setCreditNote,
  invoiceOptions,
  isEditing,
  isGeneratingNumber,
  handleInvoiceChange,
  generateCreditNoteNumber
}: CreditNoteDetailsProps) => {
  // Ensure invoiceOptions is always a valid array with proper error handling
  const safeInvoiceOptions = React.useMemo(() => {
    try {
      // Check if invoiceOptions is defined and an array
      if (!invoiceOptions) {
        console.log("CreditNoteDetails: invoiceOptions is undefined or null");
        return [];
      }
      
      if (!Array.isArray(invoiceOptions)) {
        console.log("CreditNoteDetails: invoiceOptions is not an array", invoiceOptions);
        return [];
      }
      
      // Filter out invalid options
      return invoiceOptions.filter(option => {
        if (!option || typeof option !== 'object') {
          console.log("CreditNoteDetails: Invalid option item", option);
          return false;
        }
        
        if (!('value' in option) || !('label' in option)) {
          console.log("CreditNoteDetails: Option missing required properties", option);
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

  const handleInvoiceSelect = async (value: string) => {
    try {
      if (!value) {
        console.log("No invoice selected");
        return;
      }
      
      console.log("Selected invoice ID:", value);
      await handleInvoiceChange(value);
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invoice">Invoice Reference</Label>
        <CommandSelect
          options={safeInvoiceOptions}
          value={creditNote.invoiceId || ""}
          onValueChange={handleInvoiceSelect}
          placeholder="Select an invoice"
          searchInputPlaceholder="Search invoices..."
          emptyMessage={safeInvoiceOptions.length === 0 ? "No invoices available" : "No matching invoices found"}
          disabled={isEditing} // Can't change invoice in edit mode
        />
        {safeInvoiceOptions.length === 0 && !isEditing && (
          <p className="text-xs text-amber-500 mt-1">
            No invoices available. Please create an invoice first.
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="financialYear">Financial Year</Label>
        <Input
          id="financialYear"
          value={creditNote.financialYear || ""}
          disabled
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500">
          Financial year is inherited from the selected invoice
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2 col-span-3">
          <Label htmlFor="creditNoteNumber">Credit Note Number</Label>
          <div className="flex gap-2">
            <Input
              id="creditNoteNumber"
              value={creditNote.creditNoteNumber || ""}
              onChange={(e) => setCreditNote(prev => ({ ...prev, creditNoteNumber: e.target.value }))}
              readOnly={isEditing}
              className="flex-1"
            />
            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={generateCreditNoteNumber}
                disabled={isGeneratingNumber || !creditNote.invoiceId}
                className="whitespace-nowrap"
              >
                {isGeneratingNumber ? "Generating..." : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Credit Note Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !creditNote.creditNoteDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {creditNote.creditNoteDate ? (
                format(creditNote.creditNoteDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={creditNote.creditNoteDate}
              onSelect={(date) => date && setCreditNote(prev => ({ ...prev, creditNoteDate: date }))}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Credit Note</Label>
        <Textarea
          id="reason"
          value={creditNote.reason || ""}
          onChange={(e) => setCreditNote(prev => ({ ...prev, reason: e.target.value }))}
          placeholder="E.g., Goods returned, Quality issues, etc."
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={creditNote.status} 
          onValueChange={(value) => setCreditNote(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CreditNoteDetails;
