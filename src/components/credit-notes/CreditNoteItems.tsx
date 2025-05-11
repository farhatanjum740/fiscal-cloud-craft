
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
import { AlertCircle } from "lucide-react";
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
  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];
  
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
          {safeItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 border rounded-md">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
              <p className="text-gray-600">No items added to this credit note</p>
              <p className="text-sm text-gray-500 mt-1">
                Select items from the invoice to include them in this credit note
              </p>
            </div>
          ) : (
            <>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>HSN Code</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>GST Rate (%)</TableHead>
                      <TableHead>Amount (₹)</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.productName}
                        </TableCell>
                        <TableCell>{item.hsnCode}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                            <span className="text-xs text-gray-500">{item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell>₹{item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.gstRate}%</TableCell>
                        <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            &times;
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-72 space-y-2">
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
                    
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Total:</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default CreditNoteItems;
