
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const useInvoiceState = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [financialYears, setFinancialYears] = useState<string[]>([]);
  const [isGeneratingInvoiceNumber, setIsGeneratingInvoiceNumber] = useState<boolean>(false);
  const [generatedInvoiceNumber, setGeneratedInvoiceNumber] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [gstDetails, setGstDetails] = useState<{ cgst: number; sgst: number; igst: number }>({
    cgst: 0,
    sgst: 0,
    igst: 0,
  });
  const [total, setTotal] = useState<number>(0);
  
  // Initial invoice state with status field
  const [invoice, setInvoice] = useState({
    customerId: "",
    invoiceNumber: "",
    invoiceDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    financialYear: "",
    items: [
      {
        id: uuidv4(),
        productId: "",
        productName: "",
        description: "",
        hsnCode: "",
        price: 0,
        quantity: 1,
        gstRate: 0,
        unit: "",
      },
    ],
    termsAndConditions: "1. Payment is due within 30 days from the date of invoice.\n2. Please include the invoice number as reference when making payment.",
    notes: "",
    status: "draft", // Default status
  });

  return {
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
    setTotal,
  };
};
