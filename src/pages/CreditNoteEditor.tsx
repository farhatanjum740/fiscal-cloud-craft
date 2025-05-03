
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreditNote } from "@/hooks/useCreditNote";
import CreditNoteDetails from "@/components/credit-notes/CreditNoteDetails";
import InvoiceInfo from "@/components/credit-notes/InvoiceInfo";
import CreditNoteItems from "@/components/credit-notes/CreditNoteItems";

const CreditNoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const invoiceIdFromQuery = queryParams.get('invoiceId');
  
  const isEditing = !!id;
  const queryId = invoiceIdFromQuery || undefined;
  
  const {
    creditNote,
    setCreditNote,
    loading,
    loadingData,
    invoice,
    invoiceItems,
    company,
    selectedItems,
    showQuantityError,
    setShowQuantityError,
    errorMessage,
    invoiceOptions,
    subtotal,
    gstDetails,
    total,
    isGeneratingNumber,
    handleInvoiceChange,
    toggleItemSelection,
    addSelectedItems,
    removeItem,
    updateItem,
    generateCreditNoteNumber,
    saveCreditNote
  } = useCreditNote(isEditing ? id : queryId);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Credit Note" : "Create New Credit Note"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/invoices")} disabled={loading || loadingData}>
            Cancel
          </Button>
          <Button onClick={() => saveCreditNote(navigate)} disabled={loading || loadingData}>
            {loading ? "Saving..." : "Save Credit Note"}
          </Button>
        </div>
      </div>
      
      {loadingData ? (
        <div className="flex justify-center items-center h-32">
          Loading...
        </div>
      ) : (
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
                <CreditNoteDetails
                  creditNote={creditNote}
                  setCreditNote={setCreditNote}
                  invoiceOptions={invoiceOptions || []}
                  isEditing={isEditing}
                  isGeneratingNumber={isGeneratingNumber}
                  handleInvoiceChange={handleInvoiceChange}
                  generateCreditNoteNumber={generateCreditNoteNumber}
                />
              </CardContent>
            </Card>
            
            <InvoiceInfo
              invoice={invoice}
              invoiceItems={invoiceItems || []}
              selectedItems={selectedItems}
              toggleItemSelection={toggleItemSelection}
              addSelectedItems={addSelectedItems}
              isEditing={isEditing}
            />
          </div>
          
          <CreditNoteItems
            items={creditNote.items}
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
            <Button variant="outline" onClick={() => navigate("/app/invoices")} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={() => saveCreditNote(navigate)} disabled={loading}>
              {loading ? "Saving..." : "Save Credit Note"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreditNoteEditor;
