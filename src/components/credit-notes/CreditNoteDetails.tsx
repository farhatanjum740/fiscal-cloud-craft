
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";
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
      
      <CreditNoteDatePicker
        date={creditNote.creditNoteDate}
        onDateChange={(date) => setCreditNote(prev => ({ ...prev, creditNoteDate: date }))}
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
