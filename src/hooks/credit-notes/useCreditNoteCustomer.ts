
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useCreditNoteCustomer = (invoice: any) => {
  const [customerData, setCustomerData] = useState<any>(null);

  // Fetch customer data when invoice changes
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (invoice?.customer_id) {
        try {
          const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', invoice.customer_id)
            .maybeSingle();
          
          if (error) throw error;
          setCustomerData(data);
        } catch (error) {
          console.error("Error fetching customer data:", error);
        }
      }
    };
    
    fetchCustomerData();
  }, [invoice]);
  
  // Find the customer from the invoice or from fetched data
  const customer = customerData || (invoice ? {
    name: invoice.customer_name || "",
    billing_address_line1: invoice.customer_billing_address_line1 || "",
    billing_address_line2: invoice.customer_billing_address_line2 || "",
    billing_city: invoice.customer_billing_city || "",
    billing_state: invoice.customer_billing_state || "",
    billing_pincode: invoice.customer_billing_pincode || "",
    shipping_address_line1: invoice.customer_shipping_address_line1 || "",
    shipping_address_line2: invoice.customer_shipping_address_line2 || "",
    shipping_city: invoice.customer_shipping_city || "",
    shipping_state: invoice.customer_shipping_state || "",
    shipping_pincode: invoice.customer_shipping_pincode || "",
    gstin: invoice.customer_gstin || "",
    email: invoice.customer_email || "",
    phone: invoice.customer_phone || ""
  } : null);

  return customer;
};
