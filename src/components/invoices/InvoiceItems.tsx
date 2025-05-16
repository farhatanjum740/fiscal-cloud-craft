
import { Plus } from "lucide-react";
import * as React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { InvoiceItem } from "@/types";
import InvoiceItemsTable from "./invoice-items/InvoiceItemsTable";
import InvoiceSummary from "./invoice-items/InvoiceSummary";

interface InvoiceItemsProps {
  items: InvoiceItem[];
  products: any[];
  subtotal: number;
  gstDetails: { cgst: number; sgst: number; igst: number };
  total: number;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: keyof InvoiceItem, value: any) => void;
  handleProductSelect: (id: string, productId: string) => void;
}

const InvoiceItems = ({
  items,
  products,
  subtotal,
  gstDetails,
  total,
  addItem,
  removeItem,
  updateItem,
  handleProductSelect,
}: InvoiceItemsProps) => {
  // Comprehensive safety check for products array
  const safeProducts = React.useMemo(() => {
    try {
      if (!products) {
        console.log("InvoiceItems: products is undefined or null");
        return [];
      }
      if (!Array.isArray(products)) {
        console.log("InvoiceItems: products is not an array", products);
        return [];
      }
      return products;
    } catch (error) {
      console.error("InvoiceItems: Error processing products", error);
      return [];
    }
  }, [products]);
  
  // Carefully map products to options with comprehensive error handling
  const productOptions = React.useMemo(() => {
    try {
      return safeProducts.map(product => {
        // Extra validation for product object
        if (!product) return null;
        
        try {
          const productId = product.id ? product.id.toString() : "";
          const productName = product.name || "Unknown";
          
          return { value: productId, label: productName };
        } catch (err) {
          console.error("Error processing product:", err, product);
          return null;
        }
      })
      .filter(option => option !== null && option.value !== "");
    } catch (error) {
      console.error("InvoiceItems: Error creating product options", error);
      return [];
    }
  }, [safeProducts]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Invoice Items</span>
          <Button size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardTitle>
        <CardDescription>
          Add products or services to this invoice
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InvoiceItemsTable
          items={items}
          productOptions={productOptions}
          updateItem={updateItem}
          removeItem={removeItem}
          handleProductSelect={handleProductSelect}
        />
        
        <InvoiceSummary
          subtotal={subtotal}
          gstDetails={gstDetails}
          total={total}
        />
      </CardContent>
    </Card>
  );
};

export default InvoiceItems;
