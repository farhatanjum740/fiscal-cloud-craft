
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  handleInvoiceChange
}: CreditNoteDetailsProps) => {
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
        <Input
          id="creditNoteNumber"
          value={creditNote.creditNoteNumber || ""}
          readOnly
          className="bg-gray-50"
        />
        {isGeneratingNumber && (
          <p className="text-xs text-muted-foreground flex items-center">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Generating credit note number...
          </p>
        )}
        {!creditNote.creditNoteNumber && !isGeneratingNumber && (
          <p className="text-xs text-muted-foreground">
            Credit note number will be generated automatically when you select an invoice
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
        <Textarea
          id="reason"
          value={creditNote.reason || ""}
          onChange={(e) => setCreditNote(prev => ({ ...prev, reason: e.target.value }))}
          placeholder="E.g., Goods returned, Quality issues, etc."
          rows={3}
        />
      </div>
      
      <CreditNoteStatus
        status={creditNote.status}
        onStatusChange={(value) => setCreditNote(prev => ({ ...prev, status: value }))}
      />
    </div>
  );
};

export default CreditNoteDetails;
