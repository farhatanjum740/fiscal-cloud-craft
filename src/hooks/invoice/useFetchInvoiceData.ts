
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UseFetchInvoiceDataParams {
  user: any;
  id?: string;
  setLoadingData: (loading: boolean) => void;
  setCustomers: (customers: any[]) => void;
  setProducts: (products: any[]) => void;
  setCompany: (company: any) => void;
  setCompanySettings: (settings: any) => void;
  setInvoice: (setter: (prev: any) => any) => void;
}

export const useFetchInvoiceData = ({
  user,
  id,
  setLoadingData,
  setCustomers,
  setProducts,
  setCompany,
  setCompanySettings,
  setInvoice,
}: UseFetchInvoiceDataParams) => {
  const fetchData = useCallback(async () => {
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
      
      // Fetch company data
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (companyError && companyError.code !== 'PGRST116') throw companyError;
      setCompany(companyData);
      
      // Fetch company settings
      if (companyData) {
        const { data: settingsData, error: settingsError } = await supabase
          .from('company_settings')
          .select('*')
          .eq('company_id', companyData.id)
          .maybeSingle();
        
        if (settingsError) console.error('Error fetching company settings:', settingsError);
        setCompanySettings(settingsData);
      }
      
      // If editing existing invoice, fetch its data
      if (id) {
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select('*, invoice_items(*)')
          .eq('id', id)
          .single();
        
        if (invoiceError) throw invoiceError;
        
        if (invoiceData) {
          setInvoice(prev => ({
            ...prev,
            customerId: invoiceData.customer_id,
            invoiceNumber: invoiceData.invoice_number,
            invoiceDate: new Date(invoiceData.invoice_date),
            dueDate: invoiceData.due_date ? new Date(invoiceData.due_date) : new Date(new Date().setDate(new Date().getDate() + 30)),
            financialYear: invoiceData.financial_year,
            template: invoiceData.template || 'standard',
            status: invoiceData.status || 'paid',
            termsAndConditions: invoiceData.terms_and_conditions || "1. Payment is due within 30 days from the date of invoice.\n2. Please include the invoice number as reference when making payment.",
            notes: invoiceData.notes || "",
            items: invoiceData.invoice_items.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              productName: item.product_name,
              description: item.description,
              hsnCode: item.hsn_code,
              price: item.price,
              quantity: item.quantity,
              gstRate: item.gst_rate,
              unit: item.unit,
            }))
          }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: `Failed to fetch data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  }, [user, id, setLoadingData, setCustomers, setProducts, setCompany, setCompanySettings, setInvoice]);

  return { fetchData };
};
