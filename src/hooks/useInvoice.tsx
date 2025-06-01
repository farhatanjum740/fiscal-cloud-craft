import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useInvoiceState } from "./invoice/useInvoiceState";
import { useFetchInvoiceData } from "./invoice/useFetchInvoiceData";
import { useInvoiceNumber } from "./invoice/useInvoiceNumber";
import { useInvoiceItems } from "./invoice/useInvoiceItems";
import { useInvoiceCalculations } from "./invoice/useInvoiceCalculations";
import { useSaveInvoice } from "./invoice/useSaveInvoice";
import { useFinancialYear } from "./invoice/useFinancialYear";
import { InvoiceTemplate } from "@/types/invoice-templates";

export const useInvoice = (id?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [defaultTemplate, setDefaultTemplate] = useState<InvoiceTemplate>('standard');

  const invoiceState = useInvoiceState(defaultTemplate);
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
    setTotal,
  } = invoiceState;

  // Fetch company's default template
  useEffect(() => {
    const fetchDefaultTemplate = async () => {
      if (!company?.id) return;

      try {
        const { data } = await supabase
          .from('company_settings')
          .select('default_template')
          .eq('company_id', company.id)
          .maybeSingle();

        if (data?.default_template) {
          const template = data.default_template as InvoiceTemplate;
          setDefaultTemplate(template);
          // Only update invoice template if this is a new invoice (no id)
          if (!id) {
            setInvoice(prev => ({ ...prev, template }));
          }
        }
      } catch (error) {
        console.error('Error fetching default template:', error);
      }
    };

    fetchDefaultTemplate();
  }, [company?.id, id, setInvoice]);

  const { fetchData } = useFetchInvoiceData({
    user,
    id,
    setLoadingData,
    setCustomers,
    setProducts,
    setCompany,
    setCompanySettings,
    setInvoice,
  });

  const { getCurrentFinancialYear, getAvailableFinancialYears } = useFinancialYear({
    setFinancialYears,
    setInvoice,
  });

  const { generateInvoiceNumber } = useInvoiceNumber({
    company,
    invoice,
    setInvoice,
    setIsGeneratingInvoiceNumber,
    setGeneratedInvoiceNumber,
  });

  const { addItem, removeItem, updateItem, handleProductSelect } = useInvoiceItems({
    invoice,
    setInvoice,
    products,
  });

  useInvoiceCalculations({
    invoice,
    company,
    customers,
    setSubtotal,
    setGstDetails,
    setTotal,
  });

  const { saveInvoice } = useSaveInvoice({
    user,
    company,
    invoice,
    setLoading,
    navigate,
    id,
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  useEffect(() => {
    getCurrentFinancialYear();
    getAvailableFinancialYears();
  }, [getCurrentFinancialYear, getAvailableFinancialYears]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setInvoice(prev => ({ ...prev, invoiceDate: date }));
      getCurrentFinancialYear(date);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  return {
    invoice,
    setInvoice,
    loading,
    loadingData,
    customers,
    filteredCustomers,
    products,
    filteredProducts,
    company,
    companySettings,
    financialYears,
    subtotal,
    gstDetails,
    total,
    isGeneratingInvoiceNumber,
    customerSearchQuery,
    setCustomerSearchQuery,
    productSearchQuery,
    setProductSearchQuery,
    addItem,
    removeItem,
    updateItem,
    handleProductSelect,
    handleDateChange,
    generateInvoiceNumber,
    saveInvoice,
  };
};
