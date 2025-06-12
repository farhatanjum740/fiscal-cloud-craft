
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Package } from "lucide-react";
import ProductsHeader from "@/components/products/ProductsHeader";
import ProductsSearch from "@/components/products/ProductsSearch";
import UsageWarning from "@/components/products/UsageWarning";
import ProductsTable from "@/components/products/ProductsTable";
import { useProductsData } from "@/hooks/useProductsData";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    products,
    isLoading,
    error,
    isDeleting,
    limits,
    handleDeleteProduct,
    shouldShowLimitWarning,
    isAddButtonDisabled,
    user
  } = useProductsData();
  
  // Filter products based on search - using correct property names
  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.hsn_code && product.hsn_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];
  
  if (!user) {
    return <div className="flex justify-center items-center h-64">Please log in to view products</div>;
  }
  
  return (
    <div className="space-y-6">
      <ProductsHeader 
        limits={limits}
        products={products}
        isAddButtonDisabled={isAddButtonDisabled}
      />
      
      <UsageWarning 
        limits={limits}
        shouldShow={shouldShowLimitWarning}
      />
      
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
          <ProductsSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          
          <ProductsTable 
            products={products}
            filteredProducts={filteredProducts}
            isLoading={isLoading}
            error={error}
            isDeleting={isDeleting}
            onDeleteProduct={handleDeleteProduct}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
