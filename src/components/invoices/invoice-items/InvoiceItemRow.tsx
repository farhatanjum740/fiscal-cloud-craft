
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
  return (
    <TableRow key={item.id || `item-${Math.random()}`}>
      <TableCell>
        <CommandSelect
          options={productOptions}
          value={item.productId || ""}
          onValueChange={(value) => {
            if (value) {
              handleProductSelect(item.id, value);
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
          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 1)} 
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
          onChange={(e) => updateItem(item.id, "price", Number(e.target.value) || 0)} 
          className="w-[100px]" 
        />
      </TableCell>
      <TableCell>
        <Input 
          type="number"
          min="0"
          value={item.gstRate || 0} 
          onChange={(e) => updateItem(item.id, "gstRate", Number(e.target.value) || 0)} 
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
  );
};

export default InvoiceItemRow;
