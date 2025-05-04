
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInvoice } from "@/hooks/useInvoice";
import InvoiceDetails from "@/components/invoices/InvoiceDetails";
import CompanyInfo from "@/components/invoices/CompanyInfo";
import InvoiceItems from "@/components/invoices/InvoiceItems";
import InvoiceNotes from "@/components/invoices/InvoiceNotes";

const InvoiceEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
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
  
  // Ensure customers and products are always arrays
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeProducts = Array.isArray(products) ? products : [];
  
  return (
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
              financialYears={financialYears || []}
              customers={safeCustomers}
              isEditing={isEditing}
              isGeneratingInvoiceNumber={isGeneratingInvoiceNumber}
              generateInvoiceNumber={generateInvoiceNumber}
              handleFinancialYearChange={handleFinancialYearChange}
            />
            <CompanyInfo company={company} />
          </div>
          
          <InvoiceItems
            items={invoice.items || []}
            products={safeProducts}
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
  );
};

export default InvoiceEditor;
