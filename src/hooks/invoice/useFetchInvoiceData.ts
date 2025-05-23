
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { mapInvoiceItemToFrontend } from "@/types/supabase-types";
import type { InvoiceItem } from "@/types";

export const useFetchInvoiceData = (
  user: any,
  id: string | undefined,
  isEditing: boolean,
  setLoadingData: (value: boolean) => void,
  setCustomers: (value: any[]) => void,
  setProducts: (value: any[]) => void,
  setCompany: (value: any) => void,
  setCompanySettings: (value: any) => void,
  setInvoice: (setter: (prev: any) => any) => void
) => {
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
          await fetchInvoiceData(id, user.id, setInvoice);
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
  }, [user, id, isEditing, setLoadingData, setCustomers, setProducts, setCompany, setCompanySettings, setInvoice]);
  
  const fetchInvoiceData = async (
    invoiceId: string,
    userId: string,
    setInvoice: (setter: (prev: any) => any) => void
  ) => {
    console.log("Fetching invoice data for edit mode, id:", invoiceId);
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single();
      
    if (invoiceError) {
      console.error("Error fetching invoice:", invoiceError);
      throw invoiceError;
    }
    
    console.log("Invoice data fetched:", invoiceData);
    if (invoiceData) {
      // Fetch invoice items
      console.log("Fetching invoice items for invoice ID:", invoiceId);
      const { data: invoiceItemsData, error: invoiceItemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);
        
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
      
      // Set invoice state - Fix for this issue: using a function to properly update state
      setInvoice((prev) => ({
        ...prev,
        customerId: invoiceData.customer_id,
        invoiceNumber: invoiceData.invoice_number,
        invoiceDate: new Date(invoiceData.invoice_date),
        dueDate: invoiceData.due_date ? new Date(invoiceData.due_date) : new Date(new Date().setDate(new Date().getDate() + 30)),
        items: transformedItems,
        termsAndConditions: invoiceData.terms_and_conditions || "1. Payment is due within 30 days from the date of invoice.\n2. Please include the invoice number as reference when making payment.",
        notes: invoiceData.notes || "",
        status: invoiceData.status,
        financialYear: invoiceData.financial_year,
      }));
    } else {
      console.log("No invoice data found");
    }
  };
};
