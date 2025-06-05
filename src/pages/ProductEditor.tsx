import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUsageLimits } from "@/hooks/useUsageLimits";

// Common GST rates in India
const gstRates = [
  { value: "0", label: "0%" },
  { value: "5", label: "5%" },
  { value: "12", label: "12%" },
  { value: "18", label: "18%" },
  { value: "28", label: "28%" }
];

// Common units
const unitOptions = [
  { value: "piece", label: "Piece" },
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "kg", label: "Kilogram" },
  { value: "meter", label: "Meter" },
  { value: "liter", label: "Liter" },
  { value: "set", label: "Set" },
  { value: "service", label: "Service" },
];

const ProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkProductLimit, canCreateProduct } = useUsageLimits();
  const isEditing = !!id;
  
  const [product, setProduct] = useState({
    name: "",
    description: "",
    hsn_code: "",
    price: 0,
    unit: "piece",
    gst_rate: 18,
    category: "",
    user_id: ""
  });
  
  const [loading, setLoading] = useState(false);
  
  // Fetch product if editing
  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });
  
  // Mutation for save/update product
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('User not authenticated');
      
      // Check product limit for new products
      if (!isEditing) {
        const canCreate = await canCreateProduct();
        if (!canCreate) {
          throw new Error('Product limit reached for your current plan');
        }
      }
      
      let result;
      if (isEditing) {
        result = await supabase
          .from('products')
          .update(data)
          .eq('id', id)
          .select();
      } else {
        result = await supabase
          .from('products')
          .insert(data)
          .select();
      }
      
      if (result.error) throw result.error;

      // Increment usage for new products only
      if (!isEditing) {
        try {
          await supabase.rpc('increment_usage', {
            p_user_id: user.id,
            p_company_id: data.company_id || user.id, // fallback for company_id
            p_action_type: 'product'
          });
          console.log("Successfully incremented product usage");
        } catch (usageError) {
          console.error("Error incrementing product usage:", usageError);
          // Don't fail the product creation if usage tracking fails
        }
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (id) queryClient.invalidateQueries({ queryKey: ['product', id] });
      
      toast({
        title: `Product ${isEditing ? 'Updated' : 'Created'}`,
        description: `${product.name} has been ${isEditing ? 'updated' : 'added'} successfully.`,
      });
      
      navigate("/app/products");
    },
    onError: (error: any) => {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} product. Please try again.`,
        variant: "destructive",
      });
      setLoading(false);
    }
  });
  
  // Set product data if editing
  useEffect(() => {
    if (productData) {
      setProduct({
        name: productData.name || '',
        description: productData.description || '',
        hsn_code: productData.hsn_code || '',
        price: productData.price || 0,
        unit: productData.unit || 'piece',
        gst_rate: productData.gst_rate || 18,
        category: productData.category || '',
        user_id: productData.user_id
      });
    }
  }, [productData]);
  
  // Set user_id when user loads
  useEffect(() => {
    if (user && !isEditing) {
      setProduct(prev => ({ ...prev, user_id: user.id }));
    }
  }, [user, isEditing]);
  
  const handleInputChange = (field: string, value: string | number) => {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSave = async () => {
    // Validate the form
    if (!product.name) {
      toast({
        title: "Error",
        description: "Product name is required.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save products.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    // Save to database
    const productData = {
      ...product,
      user_id: user.id,
    };
    
    mutation.mutate(productData);
  };
  
  if (isLoading && isEditing) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/products")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Enter the product or service details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter product name"
              value={product.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter product description"
              value={product.description || ''}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hsn_code">HSN/SAC Code</Label>
              <Input
                id="hsn_code"
                placeholder="Enter HSN/SAC code"
                value={product.hsn_code || ''}
                onChange={(e) => handleInputChange("hsn_code", e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Enter the Harmonized System Nomenclature code for this product or service
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="E.g., Services, Goods, etc."
                value={product.category || ''}
                onChange={(e) => handleInputChange("category", e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter price"
                value={product.price}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select 
                value={product.unit}
                onValueChange={(value) => handleInputChange("unit", value)}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gst_rate">GST Rate (%) *</Label>
              <Select 
                value={product.gst_rate.toString()}
                onValueChange={(value) => handleInputChange("gst_rate", parseInt(value))}
              >
                <SelectTrigger id="gst_rate">
                  <SelectValue placeholder="Select GST rate" />
                </SelectTrigger>
                <SelectContent>
                  {gstRates.map((rate) => (
                    <SelectItem key={rate.value} value={rate.value}>
                      {rate.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Common rates: 0%, 5%, 12%, 18%, 28%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => navigate("/app/products")}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </div>
  );
};

export default ProductEditor;
