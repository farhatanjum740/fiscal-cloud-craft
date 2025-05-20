
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreditNote } from "@/hooks/credit-notes";
import { Button } from "@/components/ui/button";
import CreditNoteHeader from "@/components/credit-notes/editor/CreditNoteHeader";
import CreditNoteContent from "@/components/credit-notes/editor/CreditNoteContent";

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
    console.log("ErrorBoundary caught an error:", error.message);
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
            onClick={() => {
              console.log("Attempting to reset error state");
              this.setState({ hasError: false });
            }} 
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
  
  // Add component mounted state to debug lifecycle issues
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    console.log("CreditNoteEditor component mounted");
    setMounted(true);
    return () => {
      console.log("CreditNoteEditor component unmounting");
    };
  }, []);
  
  console.log("CreditNoteEditor render - isEditing:", isEditing, "queryId:", queryId);
  
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
  } = useCreditNote(isEditing ? id : undefined);
  
  // Log available invoice options for debugging
  console.log("CreditNoteEditor - Invoice options received:", invoiceOptions);
  
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  
  // Ensure we have a valid array of invoiceOptions
  const safeInvoiceOptions = React.useMemo(() => {
    if (!invoiceOptions) return [];
    if (!Array.isArray(invoiceOptions)) return [];
    return invoiceOptions;
  }, [invoiceOptions]);
  
  const handleInvoiceSelect = async (value: string) => {
    setIsInvoiceLoading(true);
    console.log("CreditNoteEditor: Calling handleInvoiceChange with value:", value);
    try {
      await handleInvoiceChange(value);
    } catch (error) {
      console.error("Error in handleInvoiceSelect:", error);
      toast({
        title: "Error",
        description: "Failed to load invoice details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInvoiceLoading(false);
    }
  };
  
  const handleSave = () => {
    console.log("Save button clicked");
    
    if (!creditNote.invoiceId) {
      toast({
        title: "Missing Invoice",
        description: "Please select an invoice before saving.",
        variant: "destructive",
      });
      return;
    }
    
    if (!Array.isArray(creditNote.items) || creditNote.items.length === 0) {
      toast({
        title: "Missing Items",
        description: "Please add at least one item to the credit note.",
        variant: "destructive",
      });
      return;
    }
    
    saveCreditNote(navigate);
  };

  // Defensive check for loading and having data
  const hasRequiredData = company && safeInvoiceOptions;
  const isStillLoading = loadingData && !hasRequiredData;
  
  // Prevent rendering main content until we have data
  if (isStillLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Credit Note" : "Create New Credit Note"}
        </h1>
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading credit note data...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <CreditNoteHeader 
          isEditing={isEditing}
          loading={loading}
          loadingData={loadingData}
          handleSave={handleSave}
        />
        
        {loadingData ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading credit note data...</p>
          </div>
        ) : (
          <CreditNoteContent
            creditNote={creditNote}
            setCreditNote={setCreditNote}
            company={company}
            invoice={invoice}
            invoiceItems={Array.isArray(invoiceItems) ? invoiceItems : []}
            invoiceOptions={safeInvoiceOptions}
            isEditing={isEditing}
            isGeneratingNumber={isGeneratingNumber}
            selectedItems={selectedItems}
            toggleItemSelection={toggleItemSelection}
            addSelectedItems={addSelectedItems}
            removeItem={removeItem}
            updateItem={updateItem}
            generateCreditNoteNumber={generateCreditNoteNumber}
            handleInvoiceChange={handleInvoiceSelect}
            subtotal={subtotal}
            gstDetails={gstDetails}
            total={total}
            showQuantityError={showQuantityError}
            setShowQuantityError={setShowQuantityError}
            errorMessage={errorMessage}
            isInvoiceLoading={isInvoiceLoading}
            handleSave={handleSave} // Pass handleSave to CreditNoteContent
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CreditNoteEditor;
