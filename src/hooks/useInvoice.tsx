
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { mapInvoiceItemToFrontend, mapFrontendToInvoiceItem } from "@/types/supabase-types";
import type { InvoiceItem } from "@/types";
import { format } from "date-fns";

export const useInvoice = (id?: string) => {
  const { user } = useAuth();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [financialYears, setFinancialYears] = useState<string[]>([]);
  const [isGeneratingInvoiceNumber, setIsGeneratingInvoiceNumber] = useState(false);
  
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
    invoicePrefix: "",
  });
  
  const [subtotal, setSubtotal] = useState(0);
  const [gstDetails, setGstDetails] = useState({ cgst: 0, sgst: 0, igst: 0 });
  const [total, setTotal] = useState(0);
  
  // Generate list of financial years (current ± 5 years)
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const startYear = currentMonth >= 3 ? currentYear - 5 : currentYear - 6;
    const endYear = currentMonth >= 3 ? currentYear + 1 : currentYear;
    
    const years: string[] = [];
    for (let i = startYear; i <= endYear; i++) {
      years.push(`${i}-${i + 1}`);
    }
    
    setFinancialYears(years.reverse());
    
    // Set default financial year
    const defaultFinancialYear = getCurrentFinancialYear(currentDate);
    setInvoice(prev => ({ ...prev, financialYear: defaultFinancialYear }));
  }, []);
  
  // Get current financial year
  const getCurrentFinancialYear = (date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    if (month >= 3) { // April to March
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };
  
  // Fetch customers, products, company data, and company settings
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoadingData(true);
      try {
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id);
          
        if (customersError) throw customersError;
        setCustomers(customersData || []);
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id);
          
        if (productsError) throw productsError;
        setProducts(productsData || []);
        
        // Fetch company info (taking the first one for simplicity)
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .single();
          
        if (companyError && companyError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which we can handle
          throw companyError;
        }
        
        if (companyData) {
          setCompany(companyData);
          
          // Fetch company settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('company_settings')
            .select('*')
            .eq('company_id', companyData.id)
            .maybeSingle();
            
          if (settingsError) throw settingsError;
          
          if (settingsData) {
            setCompanySettings(settingsData);
            setInvoice(prev => ({ 
              ...prev, 
              financialYear: settingsData.current_financial_year,
              invoicePrefix: settingsData.invoice_prefix || ""
            }));
          }
        }
        
        // If editing, fetch invoice data
        if (isEditing && id) {
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();
            
          if (invoiceError) throw invoiceError;
          
          if (invoiceData) {
            // Fetch invoice items
            const { data: invoiceItemsData, error: invoiceItemsError } = await supabase
              .from('invoice_items')
              .select('*')
              .eq('invoice_id', id);
              
            if (invoiceItemsError) throw invoiceItemsError;
            
            // Transform invoice items data to match our InvoiceItem type
            const transformedItems: InvoiceItem[] = (invoiceItemsData || []).map(
              (item) => mapInvoiceItemToFrontend(item)
            );
            
            // Set invoice state
            setInvoice({
              customerId: invoiceData.customer_id,
              invoiceNumber: invoiceData.invoice_number,
              invoiceDate: new Date(invoiceData.invoice_date),
              dueDate: invoiceData.due_date ? new Date(invoiceData.due_date) : new Date(new Date().setDate(new Date().getDate() + 30)),
              items: transformedItems,
              termsAndConditions: invoiceData.terms_and_conditions || "1. Payment is due within 30 days from the date of invoice.\n2. Please include the invoice number as reference when making payment.",
              notes: invoiceData.notes || "",
              status: invoiceData.status,
              financialYear: invoiceData.financial_year,
              invoicePrefix: invoiceData.invoice_prefix || "",
            });
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: `Failed to load data: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [user, id, isEditing]);
  
  // Generate invoice number
  const generateInvoiceNumber = async () => {
    if (!company) {
      toast({
        title: "Error",
        description: "Company profile is required to generate invoice number",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGeneratingInvoiceNumber(true);
      
      // Call the database function to get a new invoice number
      const { data, error } = await supabase
        .rpc('get_next_invoice_number', {
          p_company_id: company.id,
          p_financial_year: invoice.financialYear,
          p_prefix: invoice.invoicePrefix || ""
        });
      
      if (error) throw error;
      
      setInvoice(prev => ({
        ...prev,
        invoiceNumber: data
      }));
      
      toast({
        title: "Success",
        description: "Invoice number generated successfully",
      });
    } catch (error: any) {
      console.error("Error generating invoice number:", error);
      toast({
        title: "Error",
        description: `Failed to generate invoice number: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInvoiceNumber(false);
    }
  };
  
  // Get customer by ID
  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };
  
  // Calculate totals whenever invoice items change or customer changes
  useEffect(() => {
    const calcSubtotal = invoice.items.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    
    setSubtotal(calcSubtotal);
    
    // Get customer and determine if we should use CGST+SGST or IGST
    const customer = getCustomerById(invoice.customerId);
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    invoice.items.forEach(item => {
      const gstAmount = (item.price * item.quantity * item.gstRate) / 100;
      
      if (customer && company) {
        // Compare customer's shipping state with company's state
        // If they match, use CGST+SGST, otherwise use IGST
        if (customer.shipping_state === company.state) {
          // Intra-state: Use CGST + SGST
          cgst += gstAmount / 2;
          sgst += gstAmount / 2;
        } else {
          // Inter-state: Use IGST
          igst += gstAmount;
        }
      } else {
        // Default to intra-state if customer or company not found
        cgst += gstAmount / 2;
        sgst += gstAmount / 2;
      }
    });
    
    setGstDetails({ cgst, sgst, igst });
    setTotal(calcSubtotal + cgst + sgst + igst);
    
  }, [invoice.items, invoice.customerId, customers, company]);
  
  // Handle financial year change
  const handleFinancialYearChange = (year: string) => {
    setInvoice(prev => ({ ...prev, financialYear: year }));
    
    // Clear invoice number if changing financial year
    if (year !== invoice.financialYear) {
      setInvoice(prev => ({ ...prev, invoiceNumber: "" }));
    }
  };
  
  // Add a new item to the invoice
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      productId: "",
      productName: "",
      description: "",
      hsnCode: "",
      quantity: 1,
      price: 0,
      unit: "",
      gstRate: 18,
      discountRate: 0,
    };
    
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };
  
  // Remove an item from the invoice
  const removeItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };
  
  // Update an item in the invoice
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };
  
  // Handle product selection
  const handleProductSelect = (id: string, productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      updateItem(id, "productId", productId);
      updateItem(id, "productName", selectedProduct.name);
      updateItem(id, "price", selectedProduct.price);
      updateItem(id, "hsnCode", selectedProduct.hsn_code);
      updateItem(id, "gstRate", selectedProduct.gst_rate);
      updateItem(id, "unit", selectedProduct.unit);
    }
  };
  
  // Save invoice
  const saveInvoice = async (navigate: (path: string) => void) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save an invoice.",
        variant: "destructive",
      });
      return;
    }
    
    if (!invoice.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }
    
    if (invoice.items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    if (!company) {
      toast({
        title: "Error",
        description: "Please set up your company profile before creating invoices.",
        variant: "destructive",
      });
      return;
    }
    
    if (!invoice.invoiceNumber) {
      toast({
        title: "Error",
        description: "Please generate an invoice number.",
        variant: "destructive",
      });
      return;
    }
    
    if (!invoice.financialYear) {
      toast({
        title: "Error",
        description: "Please select a financial year.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Format date for SQL
      const invoiceDateFormatted = format(invoice.invoiceDate, 'yyyy-MM-dd');
      const dueDateFormatted = invoice.dueDate ? format(invoice.dueDate, 'yyyy-MM-dd') : null;
      
      // Prepare invoice data
      const invoiceData = {
        user_id: user.id,
        customer_id: invoice.customerId,
        company_id: company.id,
        invoice_number: invoice.invoiceNumber,
        invoice_date: invoiceDateFormatted,
        due_date: dueDateFormatted,
        subtotal: subtotal,
        cgst: gstDetails.cgst,
        sgst: gstDetails.sgst,
        igst: gstDetails.igst,
        total_amount: total,
        status: invoice.status,
        terms_and_conditions: invoice.termsAndConditions,
        notes: invoice.notes,
        financial_year: invoice.financialYear,
        invoice_prefix: invoice.invoicePrefix
      };
      
      let invoiceId: string;
      
      if (isEditing && id) {
        // Update existing invoice
        const { error: updateError } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', id);
          
        if (updateError) throw updateError;
        invoiceId = id;
        
        // Delete existing invoice items
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);
          
        if (deleteError) throw deleteError;
      } else {
        // Insert new invoice
        const { data: insertData, error: insertError } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select('id')
          .single();
          
        if (insertError) throw insertError;
        if (!insertData) throw new Error("Failed to create invoice");
        
        invoiceId = insertData.id;
      }
      
      // Insert invoice items
      const invoiceItemsData = invoice.items.map(item => 
        mapFrontendToInvoiceItem(item, invoiceId)
      );
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItemsData);
        
      if (itemsError) throw itemsError;
      
      // Update company settings with the current financial year and invoice prefix
      if (companySettings) {
        const { error: settingsError } = await supabase
          .from('company_settings')
          .update({
            current_financial_year: invoice.financialYear,
            invoice_prefix: invoice.invoicePrefix,
            updated_at: new Date().toISOString()
          })
          .eq('id', companySettings.id);
          
        if (settingsError) throw settingsError;
      } else if (company) {
        // Create company settings if they don't exist
        const { error: createSettingsError } = await supabase
          .from('company_settings')
          .insert({
            company_id: company.id,
            user_id: user.id,
            current_financial_year: invoice.financialYear,
            invoice_prefix: invoice.invoicePrefix,
            invoice_counter: 1
          });
          
        if (createSettingsError) throw createSettingsError;
      }
      
      toast({
        title: "Invoice Saved",
        description: "Your invoice has been saved successfully!",
      });
      
      navigate("/app/invoices");
    } catch (error: any) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: `Failed to save invoice: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    updateItem,
    handleProductSelect,
    handleFinancialYearChange,
    generateInvoiceNumber,
    saveInvoice
  };
};
