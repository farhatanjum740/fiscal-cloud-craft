
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Company {
  id: string;
  name: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  tax_id?: string;
  created_at?: string;
  user_id: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  registered_address_line1?: string;
  registered_address_line2?: string;
  registered_city?: string;
  registered_state?: string;
  registered_pincode?: string;
  gstin?: string;
  pan?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_name?: string;
  bank_ifsc_code?: string;
  bank_branch?: string;
  contact_number?: string;
  email_id?: string;
}

export const useCompanyWithFallback = (userId?: string) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrCreateCompany = async () => {
      if (!userId) {
        console.log("No userId provided to useCompanyWithFallback");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching company for user:", userId);
        
        // Try to fetch existing company
        const { data: existingCompany, error: fetchError } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error("Error fetching company:", fetchError);
          throw fetchError;
        }

        if (existingCompany) {
          console.log("Found existing company:", existingCompany);
          setCompany(existingCompany);
        } else {
          console.log("No company found, creating default company");
          // Create a default company for the user
          const { data: newCompany, error: createError } = await supabase
            .from("companies")
            .insert({
              user_id: userId,
              name: "My Company",
              address_line1: "",
              city: "",
              state: "",
              pincode: "",
              gstin: "",
              pan: "",
              contact_number: "",
              email_id: ""
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating company:", createError);
            throw createError;
          }

          console.log("Created new company:", newCompany);
          setCompany(newCompany);
          
          toast({
            title: "Company Created",
            description: "A default company profile has been created. Please update your company details.",
          });
        }
      } catch (err) {
        console.error("Error in fetchOrCreateCompany:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch or create company";
        setError(new Error(errorMessage));
        toast({
          title: "Company Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateCompany();
  }, [userId]);

  const refetch = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data: existingCompany, error: fetchError } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setCompany(existingCompany);
    } catch (err) {
      console.error("Error refetching company:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch company";
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return { company, loading, error, refetch };
};
