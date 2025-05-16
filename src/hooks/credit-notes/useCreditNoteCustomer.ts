
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCreditNoteCustomer = (invoice: any) => {
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!invoice || !invoice.customer_id) {
        console.log("No invoice or customer_id available");
        return;
      }

      try {
        console.log("Fetching customer with ID:", invoice.customer_id);
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', invoice.customer_id)
          .single();

        if (error) {
          console.error("Error fetching customer:", error);
          return;
        }

        console.log("Customer data fetched successfully:", data);
        setCustomer(data);
      } catch (error) {
        console.error("Exception fetching customer:", error);
      }
    };

    fetchCustomer();
  }, [invoice]);

  return customer;
};
