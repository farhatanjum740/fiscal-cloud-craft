import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { mapInvoiceItemToFrontend, mapFrontendToInvoiceItem } from "@/types/supabase-types";
import type { InvoiceItem } from "@/types";
import { format } from "date-fns";

export const useInvoice = (id?: string) => {
  console.log("useInvoice hook initialized with id:", id);
  const { user } = useAuth();
  console.log("Current user:", user);
  const isEditing = !!id;
  
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
  
  // Generate list of financial years (current ± 5 years)
  useEffect(() => {
    console.log("Generating financial years list...");
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const startYear = currentMonth >= 3 ? currentYear - 5 : currentYear - 6;
    const endYear = currentMonth >= 3 ? currentYear + 1 : currentYear;
    
    const years: string[] = [];
    for (let i = startYear; i <= endYear; i++) {
      years.push(`${i}-${i + 1}`);
    }
    
    console.log("Generated financial years:", years);
    setFinancialYears(years.reverse());
    
    // Set default financial year
    const defaultFinancialYear = getCurrentFinancialYear(currentDate);
    console.log("Default financial year:", defaultFinancialYear);
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
      console.log("fetchData started, user:", user?.id);
      if (!user) {
        console.log("No user found, aborting fetch");
        return;
      }
      
      setLoadingData(true);
      try {
        console.log("Fetching customers...");
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id);
          
        if (customersError) {
          console.error("Error fetching customers:", customersError);
          throw customersError;
        }
        console.log("Customers data fetched:", customersData);
        setCustomers(customersData || []);
        
        console.log("Fetching products...");
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id);
          
        if (productsError) {
          console.error("Error fetching products:", productsError);
          throw productsError;
        }
        console.log("Products data fetched:", productsData);
        setProducts(productsData || []);
        
        console.log("Fetching company info...");
        // Fetch company info (taking the first one for simplicity)
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .single();
          
        if (companyError && companyError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which we can handle
          console.error("Error fetching company:", companyError);
          throw companyError;
        }
        
        console.log("Company data fetched:", companyData);
        if (companyData) {
          setCompany(companyData);
          
          console.log("Fetching company settings for company ID:", companyData.id);
          // Fetch company settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('company_settings')
            .select('*')
            .eq('company_id', companyData.id)
            .maybeSingle();
            
          if (settingsError) {
            console.error("Error fetching company settings:", settingsError);
            throw settingsError;
          }
          
          console.log("Company settings data fetched:", settingsData);
          if (settingsData) {
            setCompanySettings(settingsData);
            setInvoice(prev => ({ 
              ...prev, 
              financialYear: settingsData.current_financial_year,
            }));
          } else {
            console.log("No company settings found");
          }
        } else {
          console.log("No company data found");
        }
        
        // If editing, fetch invoice data
        if (isEditing && id) {
          console.log("Fetching invoice data for edit mode, id:", id);
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();
            
          if (invoiceError) {
            console.error("Error fetching invoice:", invoiceError);
            throw invoiceError;
          }
          
          console.log("Invoice data fetched:", invoiceData);
          if (invoiceData) {
            // Fetch invoice items
            console.log("Fetching invoice items for invoice ID:", id);
            const { data: invoiceItemsData, error: invoiceItemsError } = await supabase
              .from('invoice_items')
              .select('*')
              .eq('invoice_id', id);
              
            if (invoiceItemsError) {
              console.error("Error fetching invoice items:", invoiceItemsError);
              throw invoiceItemsError;
            }
            
            console.log("Invoice items data fetched:", invoiceItemsData);
            // Transform invoice items data to match our InvoiceItem type
            const transformedItems: InvoiceItem[] = (invoiceItemsData || []).map(
              (item) => mapInvoiceItemToFrontend(item)
            );
            console.log("Transformed invoice items:", transformedItems);
            
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
            });
          } else {
            console.log("No invoice data found");
          }
        }
      } catch (error: any) {
        console.error("Error in fetchData:", error);
        toast({
          title: "Error",
          description: `Failed to load data: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        console.log("fetchData completed");
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [user, id, isEditing]);
  
  // Generate invoice number - MODIFIED to prevent auto-incrementing when not needed
  const generateInvoiceNumber = useCallback(async () => {
    console.log("generateInvoiceNumber called, company:", company?.id);
    if (!company) {
      console.log("No company data, cannot generate invoice number");
      toast({
        title: "Error",
        description: "Company profile is required to generate invoice number",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGeneratingInvoiceNumber(true);
      console.log("Generating invoice number for financial year:", invoice.financialYear);
      
      // Instead of calling the database function directly which increments the counter,
      // we'll simulate what the next number would be and store it locally
      if (!generatedInvoiceNumber) {
        // Only call the database function if we haven't already generated a number
        const { data, error } = await supabase
          .rpc('get_next_invoice_number', {
            p_company_id: company.id,
            p_financial_year: invoice.financialYear,
            p_prefix: ""
          });
        
        if (error) {
          console.error("Error from get_next_invoice_number RPC:", error);
          throw error;
        }
        
        console.log("Invoice number generated:", data);
        setInvoice(prev => ({
          ...prev,
          invoiceNumber: data
        }));
        
        // Store the generated number so we don't keep incrementing
        setGeneratedInvoiceNumber(data);
      } else {
        // Reuse the already generated invoice number
        console.log("Reusing previously generated invoice number:", generatedInvoiceNumber);
        setInvoice(prev => ({
          ...prev,
          invoiceNumber: generatedInvoiceNumber
        }));
      }
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
  }, [company, invoice.financialYear, generatedInvoiceNumber]);
  
  // Get customer by ID
  const getCustomerById = (id: string) => {
    console.log("Looking for customer with ID:", id);
    console.log("Available customers:", customers);
    const foundCustomer = customers.find(customer => customer.id === id);
    console.log("Found customer:", foundCustomer);
    return foundCustomer;
  };
  
  // Calculate totals whenever invoice items change or customer changes
  useEffect(() => {
    console.log("Calculating totals...");
    console.log("Current invoice items:", invoice.items);
    console.log("Current customer ID:", invoice.customerId);
    
    const calcSubtotal = invoice.items.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    
    console.log("Calculated subtotal:", calcSubtotal);
    setSubtotal(calcSubtotal);
    
    // Get customer and determine if we should use CGST+SGST or IGST
    const customer = getCustomerById(invoice.customerId);
    console.log("Customer for GST calculation:", customer);
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    invoice.items.forEach(item => {
      const gstAmount = (item.price * item.quantity * item.gstRate) / 100;
      
      if (customer && company) {
        console.log("Customer state:", customer.shipping_state);
        console.log("Company state:", company.state);
        // Compare customer's shipping state with company's state
        // If they match, use CGST+SGST, otherwise use IGST
        if (customer.shipping_state === company.state) {
          // Intra-state: Use CGST + SGST
          cgst += gstAmount / 2;
          sgst += gstAmount / 2;
          console.log("Intra-state GST applied");
        } else {
          // Inter-state: Use IGST
          igst += gstAmount;
          console.log("Inter-state GST applied");
        }
      } else {
        // Default to intra-state if customer or company not found
        cgst += gstAmount / 2;
        sgst += gstAmount / 2;
        console.log("Default intra-state GST applied (customer or company missing)");
      }
    });
    
    console.log("GST calculations:", { cgst, sgst, igst });
    setGstDetails({ cgst, sgst, igst });
    
    const finalTotal = calcSubtotal + cgst + sgst + igst;
    console.log("Final total:", finalTotal);
    setTotal(finalTotal);
    
  }, [invoice.items, invoice.customerId, customers, company]);
  
  // Handle financial year change
  const handleFinancialYearChange = (year: string) => {
    console.log("Financial year changing to:", year);
    setInvoice(prev => ({ ...prev, financialYear: year }));
    
    // Clear invoice number and generated number if changing financial year
    if (year !== invoice.financialYear) {
      console.log("Clearing invoice number due to financial year change");
      setInvoice(prev => ({ ...prev, invoiceNumber: "" }));
      setGeneratedInvoiceNumber(null);
    }
  };
  
  // Add a new item to the invoice
  const addItem = () => {
    console.log("Adding new invoice item");
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
    console.log("Removing invoice item with ID:", id);
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };
  
  // Update an item in the invoice
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    console.log(`Updating item ${id}, field ${String(field)} to:`, value);
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };
  
  // Handle product selection
  const handleProductSelect = (id: string, productId: string) => {
    console.log(`Product selection for item ${id}, product ID: ${productId}`);
    const selectedProduct = products.find(p => p.id === productId);
    console.log("Selected product:", selectedProduct);
    
    if (selectedProduct) {
      updateItem(id, "productId", productId);
      updateItem(id, "productName", selectedProduct.name);
      updateItem(id, "price", selectedProduct.price);
      updateItem(id, "hsnCode", selectedProduct.hsn_code);
      updateItem(id, "gstRate", selectedProduct.gst_rate);
      updateItem(id, "unit", selectedProduct.unit);
    }
  };
  
  // Save invoice - MODIFIED to handle actual invoice creation
  const saveInvoice = async (navigate: (path: string) => void) => {
    console.log("saveInvoice called");
    if (!user) {
      console.log("No user found, cannot save invoice");
      toast({
        title: "Error",
        description: "You must be logged in to save an invoice.",
        variant: "destructive",
      });
      return;
    }
    
    if (!invoice.customerId) {
      console.log("No customer ID provided");
      toast({
        title: "Error",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }
    
    if (invoice.items.length === 0) {
      console.log("No invoice items provided");
      toast({
        title: "Error",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    if (!company) {
      console.log("No company data found");
      toast({
        title: "Error",
        description: "Please set up your company profile before creating invoices.",
        variant: "destructive",
      });
      return;
    }
    
    if (!invoice.invoiceNumber) {
      console.log("No invoice number, generating one");
      // Auto-generate invoice number if not set
      await generateInvoiceNumber();
      if (!invoice.invoiceNumber) {
        toast({
          title: "Error",
          description: "Failed to generate invoice number. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (!invoice.financialYear) {
      console.log("No financial year provided");
      toast({
        title: "Error",
        description: "Please select a financial year.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Processing invoice save...");
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
      };
      
      console.log("Prepared invoice data:", invoiceData);
      
      let invoiceId: string;
      
      if (isEditing && id) {
        console.log("Update mode - editing existing invoice with ID:", id);
        // Update existing invoice but don't change the invoice number
        const { data: existingInvoice, error: fetchError } = await supabase
          .from('invoices')
          .select('invoice_number')
          .eq('id', id)
          .single();
          
        if (fetchError) {
          console.error("Error fetching existing invoice:", fetchError);
          throw fetchError;
        }
        
        console.log("Existing invoice:", existingInvoice);
        
        // Preserve the original invoice number
        const updateData = {
          ...invoiceData,
          invoice_number: existingInvoice.invoice_number
        };
        
        console.log("Update data:", updateData);
        
        const { error: updateError } = await supabase
          .from('invoices')
          .update(updateData)
          .eq('id', id);
          
        if (updateError) {
          console.error("Error updating invoice:", updateError);
          throw updateError;
        }
        invoiceId = id;
        
        // Delete existing invoice items
        console.log("Deleting existing invoice items for invoice ID:", id);
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);
          
        if (deleteError) {
          console.error("Error deleting invoice items:", deleteError);
          throw deleteError;
        }
      } else {
        console.log("Insert mode - creating new invoice");
        // Insert new invoice
        const { data: insertData, error: insertError } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select('id')
          .single();
          
        if (insertError) {
          console.error("Error inserting invoice:", insertError);
          throw insertError;
        }
        if (!insertData) {
          const error = new Error("Failed to create invoice - no data returned");
          console.error(error);
          throw error;
        }
        
        console.log("New invoice created with ID:", insertData.id);
        invoiceId = insertData.id;
      }
      
      // Insert invoice items
      const invoiceItemsData = invoice.items.map(item => 
        mapFrontendToInvoiceItem(item, invoiceId)
      );
      
      console.log("Inserting invoice items:", invoiceItemsData);
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItemsData);
        
      if (itemsError) {
        console.error("Error inserting invoice items:", itemsError);
        throw itemsError;
      }
      
      // Clear the generated invoice number after successful save
      setGeneratedInvoiceNumber(null);
      
      console.log("Invoice save completed successfully");
      toast({
        title: "Invoice Saved",
        description: "Your invoice has been saved successfully!",
      });
      
      navigate("/app/invoices");
    } catch (error: any) {
      console.error("Error in saveInvoice:", error);
      toast({
        title: "Error",
        description: `Failed to save invoice: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    updateItem,
    handleProductSelect,
    handleFinancialYearChange,
    generateInvoiceNumber,
    saveInvoice
  };
};
