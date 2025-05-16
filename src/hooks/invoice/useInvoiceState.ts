
import { useState } from "react";
import type { InvoiceItem } from "@/types";

export const useInvoiceState = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [financialYears, setFinancialYears] = useState<string[]>([]);
  const [isGeneratingInvoiceNumber, setIsGeneratingInvoiceNumber] = useState(false);
  const [generatedInvoiceNumber, setGeneratedInvoiceNumber] = useState<string | null>(null);
  
  const [invoice, setInvoice] = useState({
    customerId: "",
    invoiceNumber: "",
    invoiceDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    items: [] as InvoiceItem[],
    termsAndConditions: "1. Payment is due within 30 days from the date of invoice.\n2. Please include the invoice number as reference when making payment.",
    notes: "",
    status: "draft",
    financialYear: "",
  });
  
  const [subtotal, setSubtotal] = useState(0);
  const [gstDetails, setGstDetails] = useState({ cgst: 0, sgst: 0, igst: 0 });
  const [total, setTotal] = useState(0);

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
    setTotal
  };
};
