
import React, { ErrorInfo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInvoice } from "@/hooks/useInvoice";
import InvoiceDetails from "@/components/invoices/InvoiceDetails";
import CompanyInfo from "@/components/invoices/CompanyInfo";
import InvoiceItems from "@/components/invoices/InvoiceItems";
import InvoiceNotes from "@/components/invoices/InvoiceNotes";
import { toast } from "@/components/ui/use-toast";

// Error boundary component to catch and display errors
class InvoiceEditorErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("InvoiceEditor Error Boundary caught an error:", error);
    console.error("Component Stack:", errorInfo.componentStack);
    
    // Log specific error details to help with debugging
    if (error.message.includes("undefined is not iterable")) {
      console.error("This is an iteration error. Check if arrays are properly initialized.");
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
          <p className="mb-4 text-red-600">{this.state.error?.message || "An unknown error occurred"}</p>
          <pre className="bg-gray-800 text-white p-4 rounded text-sm overflow-auto max-h-60">
            {this.state.error?.stack}
          </pre>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try reloading the page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

const InvoiceEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  // Console log to verify params
  React.useEffect(() => {
    console.log("InvoiceEditor mounted");
    console.log("id param:", id);
    console.log("isEditing:", isEditing);
  }, [id, isEditing]);
  
  const { 
    invoice,
    setInvoice,
    loading,
    loadingData,
    customers,
    products,
    company,
    financialYears,
    subtotal,
    gstDetails,
    total,
    isGeneratingInvoiceNumber,
    addItem,
    removeItem,
    updateItem,
    handleProductSelect,
    handleFinancialYearChange,
    generateInvoiceNumber,
    saveInvoice
  } = useInvoice(id);
  
  // Enhanced debug logging
  React.useEffect(() => {
    console.log("InvoiceEditor - Available data:");
    console.log("customers:", customers);
    console.log("products:", products);
    console.log("financialYears:", financialYears);
    
    // Defensive check for undefined data
    if (!customers) console.warn("Warning: customers is undefined");
    if (!products) console.warn("Warning: products is undefined");
    if (!financialYears) console.warn("Warning: financialYears is undefined");
  }, [customers, products, financialYears]);
  
  return (
    <InvoiceEditorErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Invoice" : "Create New Invoice"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/invoices")} disabled={loading || loadingData}>
              Cancel
            </Button>
            <Button onClick={() => saveInvoice(navigate)} disabled={loading || loadingData}>
              {loading ? "Saving..." : "Save Invoice"}
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
              <InvoiceDetails
                invoice={invoice}
                setInvoice={setInvoice}
                financialYears={Array.isArray(financialYears) ? financialYears : []}
                customers={Array.isArray(customers) ? customers : []}
                isEditing={isEditing}
                isGeneratingInvoiceNumber={isGeneratingInvoiceNumber}
                generateInvoiceNumber={generateInvoiceNumber}
                handleFinancialYearChange={handleFinancialYearChange}
              />
              <CompanyInfo company={company} />
            </div>
            
            <InvoiceItems
              items={Array.isArray(invoice.items) ? invoice.items : []}
              products={Array.isArray(products) ? products : []}
              subtotal={subtotal}
              gstDetails={gstDetails}
              total={total}
              addItem={addItem}
              removeItem={removeItem}
              updateItem={updateItem}
              handleProductSelect={handleProductSelect}
            />
            
            <div className="grid md:grid-cols-2 gap-6">
              <InvoiceNotes
                termsAndConditions={invoice.termsAndConditions}
                notes={invoice.notes}
                onTermsChange={(value) => setInvoice(prev => ({ ...prev, termsAndConditions: value }))}
                onNotesChange={(value) => setInvoice(prev => ({ ...prev, notes: value }))}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate("/app/invoices")} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={() => saveInvoice(navigate)} disabled={loading}>
                {loading ? "Saving..." : "Save Invoice"}
              </Button>
            </div>
          </>
        )}
      </div>
    </InvoiceEditorErrorBoundary>
  );
};

export default InvoiceEditor;
