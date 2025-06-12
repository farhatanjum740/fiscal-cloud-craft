
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/components/subscription/SubscriptionProvider';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Product } from '@/types';

export const useProductsData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { limits, usage } = useSubscriptionContext();
  const { canCreateProduct } = useUsageLimits();
  const [isDeleting, setIsDeleting] = useState(false);
  const [canAddProduct, setCanAddProduct] = useState(false);
  
  // Check if user can add products
  useEffect(() => {
    const checkLimits = async () => {
      if (user) {
        const canAdd = await canCreateProduct();
        console.log("Subscription limits:", limits);
        console.log("Current usage:", usage);
        console.log("Can create product:", canAdd);
        console.log("Products count from usage:", usage?.products_count);
        console.log("Product limit from limits:", limits?.products);
        setCanAddProduct(canAdd);
      }
    };
    checkLimits();
  }, [user, canCreateProduct, usage, limits]);
  
  // Fetch products with proper error handling
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching products for user:", user.id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      console.log("Products fetched:", data);
      return data || [];
    },
    enabled: !!user,
  });
  
  // Show error if products failed to load
  useEffect(() => {
    if (error) {
      console.error("Products query error:", error);
      toast({
        title: "Error",
        description: "Failed to load products. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [error]);
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully.",
      });
      setIsDeleting(false);
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete the product. It might be referenced in invoices.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  });
  
  // Handle product deletion
  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setIsDeleting(true);
      deleteProductMutation.mutate(id);
    }
  };

  // Check if we should show limit warning
  const shouldShowLimitWarning = () => {
    if (!limits || limits.products === -1) return false;
    const actualCount = products?.length || 0;
    return actualCount >= limits.products;
  };

  // Check if button should be disabled
  const isAddButtonDisabled = () => {
    if (!limits || limits.products === -1) return false;
    const actualCount = products?.length || 0;
    return actualCount >= limits.products;
  };

  return {
    products,
    isLoading,
    error,
    isDeleting,
    canAddProduct,
    limits,
    usage,
    handleDeleteProduct,
    shouldShowLimitWarning: shouldShowLimitWarning(),
    isAddButtonDisabled: isAddButtonDisabled(),
    user
  };
};
