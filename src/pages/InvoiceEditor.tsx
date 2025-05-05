
import React, { ErrorInfo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInvoice } from "@/hooks/useInvoice";
import InvoiceDetails from "@/components/invoices/InvoiceDetails";
import CompanyInfo from "@/components/invoices/CompanyInfo";
import InvoiceItems from "@/components/invoices/InvoiceItems";
import InvoiceNotes from "@/components/invoices/InvoiceNotes";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Enhanced Error boundary component
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
      console.error("Iteration Error Details:");
      console.error("This is likely caused by trying to iterate over undefined data");
      console.error("Check if data arrays are properly initialized and loaded before rendering");
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
          <div className="mt-4 space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Reload the page
            </Button>
            <Button
              variant="default"
              className="w-full"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try to recover
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom loading state component
const LoadingState = () => (
  <div className="flex flex-col space-y-4 items-center justify-center h-64">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    <p className="text-muted-foreground">Loading invoice data...</p>
  </div>
);

// Custom data verification component 
const DataVerificationComponent = ({ userId }: { userId: string | undefined }) => {
  const [loading, setLoading] = useState(true);
  const [customersCount, setCustomersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyData = async () => {
      if (!userId) {
        setError("User ID not available. Please sign in.");
        setLoading(false);
        return;
      }
      
      try {
        // Check customers
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', userId);
          
        if (customerError) throw customerError;
        
        // Check products
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('user_id', userId);
          
        if (productError) throw productError;
        
        setCustomersCount(customerData?.length || 0);
        setProductsCount(productData?.length || 0);
      } catch (err: any) {
        setError(`Error verifying data: ${err.message}`);
        console.error("Data verification error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    verifyData();
  }, [userId]);

  if (loading) {
    return <p>Verifying database records...</p>;
  }
  
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  
  return (
    <div className="text-sm text-muted-foreground">
      <p>Data verification complete:</p>
      <ul className="list-disc list-inside ml-2">
        <li>Found {customersCount} customer records</li>
        <li>Found {productsCount} product records</li>
      </ul>
    </div>
  );
};

const InvoiceEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  // Enhanced debug logging
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
  
  // Enhanced debug logging for data verification
  React.useEffect(() => {
    console.log("InvoiceEditor - Data Verification:");
    console.log("- customers:", customers);
    console.log("- products:", products);
    console.log("- financialYears:", financialYears);
    
    // Log each customer and product for verification
    if (Array.isArray(customers)) {
      console.log(`Customers (${customers.length}):`);
      customers.forEach((customer, i) => {
        console.log(`Customer ${i + 1}:`, customer);
      });
    }
    
    if (Array.isArray(products)) {
      console.log(`Products (${products.length}):`);
      products.forEach((product, i) => {
        console.log(`Product ${i + 1}:`, product);
      });
    }
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
          <LoadingState />
        ) : (
          <>
            <DataVerificationComponent userId={company?.user_id} />
            
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
