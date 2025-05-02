
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

const ProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [product, setProduct] = useState({
    name: "",
    description: "",
    hsnCode: "",
    price: 0,
    unit: "",
    gstRate: 18,
    category: "",
  });
  
  useEffect(() => {
    if (isEditing && id) {
      // In a real app, this would fetch the product from an API
      // For now, use mock data
      const mockProduct = {
        name: "Web Development",
        description: "Professional web development services",
        hsnCode: "998313",
        price: 5000,
        unit: "hour",
        gstRate: 18,
        category: "Services",
      };
      setProduct(mockProduct);
    }
  }, [id, isEditing]);
  
  const handleInputChange = (field: string, value: string | number) => {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSave = () => {
    // Validate the form
    if (!product.name || !product.hsnCode) {
      toast({
        title: "Error",
        description: "Product name and HSN/SAC code are required.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would save to the database
    console.log("Saving product:", product);
    
    toast({
      title: `Product ${isEditing ? 'Updated' : 'Created'}`,
      description: `${product.name} has been ${isEditing ? 'updated' : 'added'} successfully.`,
    });
    
    navigate("/app/products");
  };
  
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
          <Button onClick={handleSave}>
            Save Product
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
              value={product.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hsnCode">HSN/SAC Code *</Label>
              <Input
                id="hsnCode"
                placeholder="Enter HSN/SAC code"
                value={product.hsnCode}
                onChange={(e) => handleInputChange("hsnCode", e.target.value)}
                required
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
                value={product.category}
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
              <Input
                id="unit"
                placeholder="E.g., hour, piece, kg"
                value={product.unit}
                onChange={(e) => handleInputChange("unit", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gstRate">GST Rate (%) *</Label>
              <Input
                id="gstRate"
                type="number"
                min="0"
                max="28"
                placeholder="Enter GST rate"
                value={product.gstRate}
                onChange={(e) => handleInputChange("gstRate", parseInt(e.target.value))}
                required
              />
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
        <Button onClick={handleSave}>
          Save Product
        </Button>
      </div>
    </div>
  );
};

export default ProductEditor;
