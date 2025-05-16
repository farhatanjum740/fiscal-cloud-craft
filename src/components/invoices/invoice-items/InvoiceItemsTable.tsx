
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InvoiceItemRow from "./InvoiceItemRow";
import type { InvoiceItem } from "@/types";

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  productOptions: { value: string; label: string }[];
  updateItem: (id: string, field: keyof InvoiceItem, value: any) => void;
  removeItem: (id: string) => void;
  handleProductSelect: (id: string, productId: string) => void;
}

const InvoiceItemsTable = ({
  items,
  productOptions,
  updateItem,
  removeItem,
  handleProductSelect,
}: InvoiceItemsTableProps) => {
  const safeItems = React.useMemo(() => {
    try {
      if (!items) {
        console.log("InvoiceItemsTable: items is undefined or null");
        return [];
      }
      if (!Array.isArray(items)) {
        console.log("InvoiceItemsTable: items is not an array", items);
        return [];
      }
      return items;
    } catch (error) {
      console.error("InvoiceItemsTable: Error processing items", error);
      return [];
    }
  }, [items]);

  return (
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
              <InvoiceItemRow
                key={item.id || `item-${Math.random()}`}
                item={item}
                productOptions={productOptions}
                updateItem={updateItem}
                removeItem={removeItem}
                handleProductSelect={handleProductSelect}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceItemsTable;
