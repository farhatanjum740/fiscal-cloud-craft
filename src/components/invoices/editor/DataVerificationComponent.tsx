
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DataVerificationComponentProps {
  userId: string | undefined;
}

const DataVerificationComponent = ({ userId }: DataVerificationComponentProps) => {
  const [loading, setLoading] = useState(true);
  const [customersCount, setCustomersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyData = async () => {
      if (!userId) {
        setError("User ID not available. Please sign in.");
        setLoading(false);
        return;
      }
      
      try {
        // Check customers
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', userId);
          
        if (customerError) throw customerError;
        
        // Check products
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('user_id', userId);
          
        if (productError) throw productError;
        
        setCustomersCount(customerData?.length || 0);
        setProductsCount(productData?.length || 0);
      } catch (err: any) {
        setError(`Error verifying data: ${err.message}`);
        console.error("Data verification error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    verifyData();
  }, [userId]);

  if (loading) {
    return <p>Verifying database records...</p>;
  }
  
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  
  return (
    <div className="text-sm text-muted-foreground">
      <p>Data verification complete:</p>
      <ul className="list-disc list-inside ml-2">
        <li>Found {customersCount} customer records</li>
        <li>Found {productsCount} product records</li>
      </ul>
    </div>
  );
};

export default DataVerificationComponent;
