
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { CreditNoteItem } from "@/types";

interface CreditNoteItemsProps {
  items: CreditNoteItem[];
  subtotal: number;
  gstDetails: { 
    cgst: number; 
    sgst: number; 
    igst: number;
  };
  total: number;
  showQuantityError: boolean;
  setShowQuantityError: (value: boolean) => void;
  errorMessage: string;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: keyof CreditNoteItem, value: any) => void;
}

const CreditNoteItems = ({
  items,
  subtotal,
  gstDetails,
  total,
  showQuantityError,
  setShowQuantityError,
  errorMessage,
  removeItem,
  updateItem
}: CreditNoteItemsProps) => {
  return (
    <>
      <AlertDialog open={showQuantityError} onOpenChange={setShowQuantityError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quantity Limit Exceeded</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Card>
        <CardHeader>
          <CardTitle>Credit Note Items</CardTitle>
          <CardDescription>
            Items included in this credit note
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
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
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32">
                      No items added yet. Select invoice items to add to this credit note.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.hsnCode}</TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity} 
                          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} 
                          className="w-[80px]" 
                        />
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>₹{item.price}</TableCell>
                      <TableCell>{item.gstRate}%</TableCell>
                      <TableCell>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={() => removeItem(item.id)}
                        >
                          &times;
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
    </>
  );
};

export default CreditNoteItems;
