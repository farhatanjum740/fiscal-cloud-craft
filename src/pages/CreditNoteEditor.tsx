
import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreditNote } from "@/hooks/credit-notes";
import { AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import CreditNoteDetails from "@/components/credit-notes/CreditNoteDetails";
import InvoiceInfo from "@/components/credit-notes/InvoiceInfo";
import CreditNoteItems from "@/components/credit-notes/CreditNoteItems";

// Error boundary to handle any rendering errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode }, 
  { hasError: boolean, errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in CreditNoteEditor:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-300 rounded-lg">
          <div className="flex items-center text-red-800 mb-4">
            <AlertCircle className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-medium">Something went wrong</h3>
          </div>
          <p className="text-red-700 mb-4">{this.state.errorMessage}</p>
          <Button 
            onClick={() => this.setState({ hasError: false })} 
            variant="outline"
          >
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  
  const handleInvoiceSelect = async (value: string) => {
    setIsInvoiceLoading(true);
    console.log("CreditNoteEditor: Calling handleInvoiceChange with value:", value);
    try {
      await handleInvoiceChange(value);
    } catch (error) {
      console.error("Error in handleInvoiceSelect:", error);
    } finally {
      setIsInvoiceLoading(false);
    }
  };
  
  const handleSave = () => {
    if (!creditNote.invoiceId) {
      toast({
        title: "Missing Invoice",
        description: "Please select an invoice before saving.",
        variant: "destructive",
      });
      return;
    }
    
    if (creditNote.items.length === 0) {
      toast({
        title: "Missing Items",
        description: "Please add at least one item to the credit note.",
        variant: "destructive",
      });
      return;
    }
    
    saveCreditNote(navigate);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Credit Note" : "Create New Credit Note"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/invoices")} disabled={loading || loadingData}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || loadingData}>
              {loading ? "Saving..." : "Save Credit Note"}
            </Button>
          </div>
        </div>
        
        {loadingData ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading credit note data...</p>
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
                    handleInvoiceChange={handleInvoiceSelect}
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
                isLoading={isInvoiceLoading}
              />
            </div>
            
            <CreditNoteItems
              items={creditNote.items || []}
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
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Credit Note"}
              </Button>
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CreditNoteEditor;
