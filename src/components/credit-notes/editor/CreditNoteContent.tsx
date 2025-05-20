
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreditNoteDetails from "@/components/credit-notes/CreditNoteDetails";
import InvoiceInfo from "@/components/credit-notes/InvoiceInfo";
import CreditNoteItems from "@/components/credit-notes/CreditNoteItems";
import { CreditNoteData } from "@/hooks/credit-notes/types";

interface CreditNoteContentProps {
  creditNote: CreditNoteData;
  setCreditNote: (value: React.SetStateAction<CreditNoteData>) => void;
  company: any;
  invoice: any;
  invoiceItems: any[];
  invoiceOptions: { value: string; label: string }[];
  isEditing: boolean;
  isGeneratingNumber: boolean;
  selectedItems: {[key: string]: boolean};
  toggleItemSelection: (itemId: string) => void;
  addSelectedItems: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: any, value: any) => void;
  generateCreditNoteNumber: () => Promise<string | null>;
  handleInvoiceChange: (value: string) => Promise<void>;
  subtotal: number;
  gstDetails: { cgst: number; sgst: number; igst: number; };
  total: number;
  showQuantityError: boolean;
  setShowQuantityError: (value: boolean) => void;
  errorMessage: string;
  isInvoiceLoading: boolean;
}

const CreditNoteContent = ({
  creditNote,
  setCreditNote,
  company,
  invoice,
  invoiceItems,
  invoiceOptions,
  isEditing,
  isGeneratingNumber,
  selectedItems,
  toggleItemSelection,
  addSelectedItems,
  removeItem,
  updateItem,
  generateCreditNoteNumber,
  handleInvoiceChange,
  subtotal,
  gstDetails,
  total,
  showQuantityError,
  setShowQuantityError,
  errorMessage,
  isInvoiceLoading
}: CreditNoteContentProps) => {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Credit Note Details</CardTitle>
            <CardDescription>
              Basic information about the credit note
            </CardDescription>
          </CardHeader>
          <CardContent>
            {company && (
              <CreditNoteDetails
                creditNote={creditNote}
                setCreditNote={setCreditNote}
                invoiceOptions={invoiceOptions}
                isEditing={isEditing}
                isGeneratingNumber={isGeneratingNumber}
                handleInvoiceChange={handleInvoiceChange}
                generateCreditNoteNumber={generateCreditNoteNumber}
              />
            )}
          </CardContent>
        </Card>
        
        <InvoiceInfo
          invoice={invoice}
          invoiceItems={Array.isArray(invoiceItems) ? invoiceItems : []}
          selectedItems={selectedItems || {}}
          toggleItemSelection={toggleItemSelection}
          addSelectedItems={addSelectedItems}
          isEditing={isEditing}
          isLoading={isInvoiceLoading}
        />
      </div>
      
      <CreditNoteItems
        items={Array.isArray(creditNote.items) ? creditNote.items : []}
        subtotal={subtotal}
        gstDetails={gstDetails}
        total={total}
        showQuantityError={showQuantityError}
        setShowQuantityError={setShowQuantityError}
        errorMessage={errorMessage}
        removeItem={removeItem}
        updateItem={updateItem}
      />
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()} 
          disabled={false}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => {}} // Will be set in parent component
          disabled={false}
        >
          Save Credit Note
        </Button>
      </div>
    </>
  );
};

export default CreditNoteContent;
