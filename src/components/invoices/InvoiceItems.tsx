
import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CommandSelect } from "@/components/ui/command-select";
import type { InvoiceItem } from "@/types";
import { toast } from "@/components/ui/use-toast";

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
  // Ensure we have valid arrays with more explicit checks
  const safeItems = React.useMemo(() => {
    if (!items) {
      console.log("InvoiceItems: items is undefined or null");
      return [];
    }
    if (!Array.isArray(items)) {
      console.log("InvoiceItems: items is not an array", items);
      return [];
    }
    return items;
  }, [items]);
  
  const safeProducts = React.useMemo(() => {
    if (!products) {
      console.log("InvoiceItems: products is undefined or null");
      return [];
    }
    if (!Array.isArray(products)) {
      console.log("InvoiceItems: products is not an array", products);
      return [];
    }
    return products;
  }, [products]);
  
  // Convert products to options with additional safety checks
  const productOptions = React.useMemo(() => {
    return safeProducts.map(product => {
      // Extra validation for product object
      if (!product) return null;
      const productId = product.id ? product.id.toString() : "";
      const productName = product.name || "Unknown";
      
      return { value: productId, label: productName };
    })
    .filter(option => option !== null && option.value !== "");
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
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Item</TableHead>
                <TableHead>HSN/SAC</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>GST Rate (%)</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-32">
                    No items added yet. Click "Add Item" to add products or services.
                  </TableCell>
                </TableRow>
              ) : (
                safeItems.map((item) => (
                  <TableRow key={item.id || `item-${Math.random()}`}>
                    <TableCell>
                      <CommandSelect
                        options={productOptions}
                        value={item.productId || ""}
                        onValueChange={(value) => {
                          handleProductSelect(item.id, value);
                        }}
                        placeholder="Select product"
                        searchInputPlaceholder="Search products..."
                        emptyMessage="No products found."
                        className="w-[180px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={item.hsnCode || ""} 
                        onChange={(e) => updateItem(item.id, "hsnCode", e.target.value)} 
                        className="w-[100px]" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        min="1"
                        value={item.quantity || 1} 
                        onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} 
                        className="w-[80px]" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={item.unit || ""} 
                        onChange={(e) => updateItem(item.id, "unit", e.target.value)} 
                        className="w-[80px]" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        min="0"
                        value={item.price || 0} 
                        onChange={(e) => updateItem(item.id, "price", Number(e.target.value))} 
                        className="w-[100px]" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        min="0"
                        value={item.gstRate || 0} 
                        onChange={(e) => updateItem(item.id, "gstRate", Number(e.target.value))} 
                        className="w-[80px]" 
                      />
                    </TableCell>
                    <TableCell>
                      {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => removeItem(item.id)}
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
        
        <div className="mt-6 flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {gstDetails.cgst > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">CGST:</span>
                <span>₹{gstDetails.cgst.toFixed(2)}</span>
              </div>
            )}
            {gstDetails.sgst > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">SGST:</span>
                <span>₹{gstDetails.sgst.toFixed(2)}</span>
              </div>
            )}
            {gstDetails.igst > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">IGST:</span>
                <span>₹{gstDetails.igst.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceItems;
