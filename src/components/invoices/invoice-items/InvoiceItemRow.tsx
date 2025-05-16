
import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { CommandSelect } from "@/components/ui/command-select";
import type { InvoiceItem } from "@/types";

interface InvoiceItemRowProps {
  item: InvoiceItem;
  productOptions: { value: string; label: string }[];
  updateItem: (id: string, field: keyof InvoiceItem, value: any) => void;
  removeItem: (id: string) => void;
  handleProductSelect: (id: string, productId: string) => void;
}

const InvoiceItemRow = ({
  item,
  productOptions,
  updateItem,
  removeItem,
  handleProductSelect,
}: InvoiceItemRowProps) => {
  // Make sure item is valid and has an ID
  const itemId = item?.id || `item-${Math.random()}`;
  
  // Ensure product options is valid
  const safeProductOptions = React.useMemo(() => {
    if (!Array.isArray(productOptions)) return [];
    return productOptions.filter(option => 
      option && 
      typeof option === 'object' && 
      'value' in option && 
      'label' in option &&
      option.value && 
      option.label
    );
  }, [productOptions]);

  // Helper function for safe item property access
  const getItemValue = (field: keyof InvoiceItem, defaultValue: any = ""): any => {
    if (!item) return defaultValue;
    return item[field] !== undefined && item[field] !== null ? item[field] : defaultValue;
  };
  
  // Calculate the subtotal with safety checks
  const calculateSubtotal = () => {
    const price = Number(getItemValue("price", 0));
    const quantity = Number(getItemValue("quantity", 1));
    return isNaN(price) || isNaN(quantity) ? "0.00" : (price * quantity).toFixed(2);
  };

  return (
    <TableRow key={itemId}>
      <TableCell>
        <CommandSelect
          options={safeProductOptions}
          value={getItemValue("productId", "")}
          onValueChange={(value) => {
            if (value) {
              handleProductSelect(itemId, value);
            }
          }}
          placeholder="Select product"
          searchInputPlaceholder="Search products..."
          emptyMessage="No products found."
          className="w-[180px]"
        />
      </TableCell>
      <TableCell>
        <Input 
          value={getItemValue("hsnCode", "")} 
          onChange={(e) => updateItem(itemId, "hsnCode", e.target.value)} 
          className="w-[100px]" 
        />
      </TableCell>
      <TableCell>
        <Input 
          type="number"
          min="1"
          value={getItemValue("quantity", 1)} 
          onChange={(e) => updateItem(itemId, "quantity", Number(e.target.value) || 1)} 
          className="w-[80px]" 
        />
      </TableCell>
      <TableCell>
        <Input 
          value={getItemValue("unit", "")} 
          onChange={(e) => updateItem(itemId, "unit", e.target.value)} 
          className="w-[80px]" 
        />
      </TableCell>
      <TableCell>
        <Input 
          type="number"
          min="0"
          value={getItemValue("price", 0)} 
          onChange={(e) => updateItem(itemId, "price", Number(e.target.value) || 0)} 
          className="w-[100px]" 
        />
      </TableCell>
      <TableCell>
        <Input 
          type="number"
          min="0"
          value={getItemValue("gstRate", 0)} 
          onChange={(e) => updateItem(itemId, "gstRate", Number(e.target.value) || 0)} 
          className="w-[80px]" 
        />
      </TableCell>
      <TableCell>
        {calculateSubtotal()}
      </TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-red-500"
          onClick={() => removeItem(itemId)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default InvoiceItemRow;
