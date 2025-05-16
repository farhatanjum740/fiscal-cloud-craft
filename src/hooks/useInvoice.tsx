
import { useAuth } from "@/contexts/AuthContext";
import { useInvoiceState } from "./invoice/useInvoiceState";
import { useFinancialYear } from "./invoice/useFinancialYear";
import { useInvoiceItems } from "./invoice/useInvoiceItems";
import { useInvoiceCalculations } from "./invoice/useInvoiceCalculations";
import { useInvoiceNumber } from "./invoice/useInvoiceNumber";
import { useFetchInvoiceData } from "./invoice/useFetchInvoiceData";
import { useSaveInvoice } from "./invoice/useSaveInvoice";
import { useEffect } from "react";

export const useInvoice = (id?: string) => {
  console.log("useInvoice hook initialized with id:", id);
  const { user } = useAuth();
  console.log("Current user:", user);
  const isEditing = !!id;
  
  // State management
  const {
    loading,
    setLoading,
    loadingData,
    setLoadingData,
    customers,
    setCustomers,
    products,
    setProducts,
    company,
    setCompany,
    companySettings,
    setCompanySettings,
    financialYears,
    setFinancialYears,
    isGeneratingInvoiceNumber,
    setIsGeneratingInvoiceNumber,
    generatedInvoiceNumber,
    setGeneratedInvoiceNumber,
    invoice,
    setInvoice,
    subtotal,
    setSubtotal,
    gstDetails,
    setGstDetails,
    total,
    setTotal
  } = useInvoiceState();
  
  // Financial year management
  const { 
    updateFinancialYearFromDate 
  } = useFinancialYear(setFinancialYears, setInvoice);
  
  // Update financial year when invoice date changes
  const handleDateChange = (date: Date) => {
    setInvoice(prev => ({ ...prev, invoiceDate: date }));
    updateFinancialYearFromDate(date, setInvoice, setGeneratedInvoiceNumber);
  };
  
  // Invoice items management
  const { addItem, removeItem, updateItem: baseUpdateItem } = useInvoiceItems(setInvoice);
  const handleProductSelect = (id: string, productId: string) => {
    baseUpdateItem(id, "productId", productId);
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      baseUpdateItem(id, "productName", selectedProduct.name);
      baseUpdateItem(id, "price", selectedProduct.price);
      baseUpdateItem(id, "hsnCode", selectedProduct.hsn_code);
      baseUpdateItem(id, "gstRate", selectedProduct.gst_rate);
      baseUpdateItem(id, "unit", selectedProduct.unit);
    }
  };
  
  // Calculations
  useInvoiceCalculations(invoice, customers, company, setSubtotal, setGstDetails, setTotal);
  
  // Invoice number generation
  const { generateInvoiceNumber } = useInvoiceNumber(
    company,
    invoice,
    setInvoice,
    isGeneratingInvoiceNumber,
    setIsGeneratingInvoiceNumber,
    generatedInvoiceNumber,
    setGeneratedInvoiceNumber
  );
  
  // Data fetching
  useFetchInvoiceData(
    user,
    id,
    isEditing,
    setLoadingData,
    setCustomers,
    setProducts,
    setCompany,
    setCompanySettings,
    setInvoice
  );
  
  // Invoice saving
  const { saveInvoice } = useSaveInvoice(
    user,
    invoice,
    company,
    subtotal,
    gstDetails,
    total,
    isEditing,
    id,
    loading,
    setLoading,
    generateInvoiceNumber,
    setGeneratedInvoiceNumber
  );
  
  // Debug logging for state changes
  useEffect(() => {
    console.log("STATE CHANGE - customers:", customers);
    console.log("STATE CHANGE - products:", products);
    console.log("STATE CHANGE - financialYears:", financialYears);
  }, [customers, products, financialYears]);

  return {
    invoice,
    setInvoice,
    loading,
    loadingData,
    customers,
    products,
    company,
    companySettings,
    financialYears,
    subtotal,
    gstDetails,
    total,
    isGeneratingInvoiceNumber,
    addItem,
    removeItem,
    updateItem: baseUpdateItem,
    handleProductSelect,
    handleDateChange,
    generateInvoiceNumber,
    saveInvoice
  };
};
