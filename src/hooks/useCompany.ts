
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
}

export const useCompany = (userId?: string) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error) throw error;

        setCompany(data);
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch company"));
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [userId]);

  return { company, loading, error };
};
