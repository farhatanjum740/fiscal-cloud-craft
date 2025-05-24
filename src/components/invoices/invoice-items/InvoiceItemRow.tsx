
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import type { InvoiceItem } from "@/types";

interface InvoiceItemRowProps {
  item: InvoiceItem;
  productOptions: { value: string; label: string }[];
  updateItem: (id: string, field: keyof InvoiceItem, value: any) => void;
  removeItem: (id: string) => void;
  handleProductSelect: (itemId: string, productId: string) => void;
}

// Standard units commonly used in Indian businesses
const unitOptions = [
  { value: "pcs", label: "Pieces (Pcs)" },
  { value: "kg", label: "Kilograms (Kg)" },
  { value: "gm", label: "Grams (Gm)" },
  { value: "ltr", label: "Litres (Ltr)" },
  { value: "ml", label: "Millilitres (ML)" },
  { value: "mtr", label: "Metres (Mtr)" },
  { value: "cm", label: "Centimetres (CM)" },
  { value: "ft", label: "Feet (Ft)" },
  { value: "inch", label: "Inches (Inch)" },
  { value: "sqft", label: "Square Feet (Sq Ft)" },
  { value: "sqm", label: "Square Metres (Sq M)" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
  { value: "set", label: "Set" },
  { value: "pair", label: "Pair" },
  { value: "nos", label: "Numbers (Nos)" },
  { value: "dzn", label: "Dozen (Dzn)" },
  { value: "roll", label: "Roll" },
  { value: "sheet", label: "Sheet" },
  { value: "bundle", label: "Bundle" },
  { value: "bottle", label: "Bottle" },
  { value: "can", label: "Can" },
  { value: "tube", label: "Tube" },
  { value: "bag", label: "Bag" },
  { value: "carton", label: "Carton" },
];

const InvoiceItemRow = ({
  item,
  productOptions,
  updateItem,
  removeItem,
  handleProductSelect,
}: InvoiceItemRowProps) => {
  return (
    <TableRow>
      <TableCell>
        <Select
          value={item.productId || ""}
          onValueChange={(value) => handleProductSelect(item.id, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {productOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          value={item.hsnCode}
          onChange={(e) => updateItem(item.id, "hsnCode", e.target.value)}
          placeholder="HSN Code"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) =>
            updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)
          }
          placeholder="Qty"
          min="0"
          step="0.01"
        />
      </TableCell>
      <TableCell>
        <Select
          value={item.unit || ""}
          onValueChange={(value) => updateItem(item.id, "unit", value)}
        >
          <SelectTrigger>
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
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={item.price}
          onChange={(e) =>
            updateItem(item.id, "price", parseFloat(e.target.value) || 0)
          }
          placeholder="Price"
          min="0"
          step="0.01"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={item.gstRate}
          onChange={(e) =>
            updateItem(item.id, "gstRate", parseFloat(e.target.value) || 0)
          }
          placeholder="GST %"
          min="0"
          max="100"
          step="0.01"
        />
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default InvoiceItemRow;
