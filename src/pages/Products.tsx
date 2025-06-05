import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Package,
  Plus,
  Search,
  Edit,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSubscriptionContext } from "@/components/subscription/SubscriptionProvider";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import type { Product } from "@/types";

const Products = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { limits, usage } = useSubscriptionContext();
  const { canCreateProduct } = useUsageLimits();
  const [searchTerm, setSearchTerm] = useState("");
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
  
  // Filter products based on search
  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.hsn_code && product.hsn_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Get usage display text
  const getUsageText = () => {
    if (!limits || !usage) return '';
    if (limits.products === -1) return 'Unlimited';
    
    // Use actual products count from the database instead of usage table
    const actualCount = products?.length || 0;
    console.log("Actual products count from DB:", actualCount);
    return `${actualCount} / ${limits.products}`;
  };

  // Get usage color
  const getUsageColor = () => {
    if (!limits || limits.products === -1) return 'text-green-600';
    
    // Use actual products count from the database
    const actualCount = products?.length || 0;
    const percentage = actualCount / limits.products * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
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
  
  if (!user) {
    return <div className="flex justify-center items-center h-64">Please log in to view products</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products & Services</h1>
          {limits && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Usage:</span>
              <Badge variant="outline" className={getUsageColor()}>
                {getUsageText()}
              </Badge>
            </div>
          )}
        </div>
        {isAddButtonDisabled() ? (
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        ) : (
          <Link to="/app/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        )}
      </div>
      
      {shouldShowLimitWarning() && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-800">
              You've reached your product limit ({limits?.products} products). 
              Upgrade your plan to add more products.
            </p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Manage Products
          </CardTitle>
          <CardDescription>
            View and manage your products and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-6">
            <div className="relative flex-grow">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>HSN/SAC Code</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead>GST Rate (%)</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32 text-red-500">
                      Failed to load products. Please refresh the page.
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32">
                      {products?.length === 0 ? "No products found. Create your first product!" : "No products match your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.hsn_code}</TableCell>
                      <TableCell>{product.price.toLocaleString()}</TableCell>
                      <TableCell>{product.gst_rate}%</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Link to={`/app/products/edit/${product.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
