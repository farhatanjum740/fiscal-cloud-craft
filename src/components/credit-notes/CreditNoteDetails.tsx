
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import CreditNoteInvoiceSelect from "./details/CreditNoteInvoiceSelect";
import CreditNoteDatePicker from "./details/CreditNoteDatePicker";
import CreditNoteStatus from "./details/CreditNoteStatus";

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
  generateCreditNoteNumber: () => Promise<string | null>;
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
  // Debug log the current credit note details
  useEffect(() => {
    console.log("CreditNoteDetails rendered with:", {
      invoiceId: creditNote.invoiceId,
      financialYear: creditNote.financialYear,
      creditNoteNumber: creditNote.creditNoteNumber
    });
  }, [creditNote.invoiceId, creditNote.financialYear, creditNote.creditNoteNumber]);

  const handleGenerateNumber = async () => {
    if (!creditNote.financialYear) {
      console.error("No financial year available - please select an invoice first");
      return;
    }
    
    try {
      await generateCreditNoteNumber();
    } catch (error) {
      console.error("Error generating credit note number:", error);
    }
  };

  // Standard credit note reasons
  const creditNoteReasons = [
    { value: "goods_returned", label: "Goods Returned" },
    { value: "quality_issues", label: "Quality Issues" },
    { value: "billing_error", label: "Billing Error" },
    { value: "damaged_goods", label: "Damaged Goods" },
    { value: "overcharge", label: "Overcharge" },
    { value: "duplicate_invoice", label: "Duplicate Invoice" },
    { value: "discount_adjustment", label: "Discount Adjustment" },
    { value: "cancellation", label: "Order Cancellation" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="space-y-4">
      <CreditNoteInvoiceSelect
        invoiceId={creditNote.invoiceId || ""}
        invoiceOptions={invoiceOptions}
        isEditing={isEditing}
        handleInvoiceSelect={handleInvoiceChange}
      />
      
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
      
      <div className="space-y-2">
        <Label htmlFor="creditNoteNumber">Credit Note Number</Label>
        <div className="flex space-x-2">
          <Input
            id="creditNoteNumber"
            value={creditNote.creditNoteNumber || ""}
            readOnly
            className="bg-gray-50 flex-1"
          />
          <Button 
            type="button" 
            onClick={handleGenerateNumber}
            disabled={isGeneratingNumber || !creditNote.financialYear}
            size="sm"
          >
            {isGeneratingNumber ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
        {isGeneratingNumber && (
          <p className="text-xs text-muted-foreground flex items-center">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Generating credit note number...
          </p>
        )}
        {!creditNote.creditNoteNumber && !isGeneratingNumber && (
          <p className="text-xs text-muted-foreground">
            Click "Generate" to create a credit note number for the selected financial year
          </p>
        )}
      </div>
      
      <CreditNoteDatePicker
        date={creditNote.creditNoteDate}
        onDateChange={(date) => setCreditNote(prev => ({ ...prev, creditNoteDate: date }))}
        financialYear={creditNote.financialYear}
      />
      
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Credit Note</Label>
        <Select 
          value={creditNote.reason || ""} 
          onValueChange={(value) => setCreditNote(prev => ({ ...prev, reason: value }))}
        >
          <SelectTrigger id="reason">
            <SelectValue placeholder="Select reason for credit note" />
          </SelectTrigger>
          <SelectContent>
            {creditNoteReasons.map((reason) => (
              <SelectItem key={reason.value} value={reason.value}>
                {reason.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <CreditNoteStatus
        status={creditNote.status || "issued"}
        onStatusChange={(value) => setCreditNote(prev => ({ ...prev, status: value }))}
      />
    </div>
  );
};

export default CreditNoteDetails;
