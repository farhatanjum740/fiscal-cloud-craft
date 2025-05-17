
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvoiceInfoProps {
  invoice: any;
  invoiceItems: any[];
  selectedItems: {[key: string]: boolean};
  toggleItemSelection: (id: string) => void;
  addSelectedItems: () => void;
  isEditing: boolean;
  isLoading?: boolean;
}

const InvoiceInfo = ({
  invoice,
  invoiceItems = [], // Provide a default empty array
  selectedItems = {}, // Provide a default empty object
  toggleItemSelection,
  addSelectedItems,
  isEditing,
  isLoading = false
}: InvoiceInfoProps) => {
  // Ensure invoiceItems is always an array
  const safeInvoiceItems = Array.isArray(invoiceItems) ? invoiceItems : [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Information</CardTitle>
        <CardDescription>
          Details of the invoice against which this credit note is issued
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500">Loading invoice data...</p>
          </div>
        ) : invoice ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-gray-50">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-lg">Invoice: {invoice.invoice_number}</h3>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {invoice.status && typeof invoice.status === 'string' ? 
                    invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 
                    'Unknown'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Invoice Date:</p>
                  <p>{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('en-IN') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Amount:</p>
                  <p>₹{invoice.total_amount ? Number(invoice.total_amount).toLocaleString() : '0'}</p>
                </div>
              </div>
            </div>
            
            {!isEditing && safeInvoiceItems.length > 0 && (
              <>
                <h4 className="font-medium mt-4">Invoice Items</h4>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <div className="sr-only">Select</div>
                        </TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity Available</TableHead>
                        <TableHead>Price (₹)</TableHead>
                        <TableHead>GST Rate (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeInvoiceItems.map((item) => (
                        <TableRow key={item.id || `item-${Math.random()}`} className={item.availableQuantity <= 0 ? "opacity-50" : ""}>
                          <TableCell>
                            <input 
                              type="checkbox" 
                              checked={!!selectedItems[item.id]} 
                              onChange={() => toggleItemSelection(item.id)}
                              disabled={item.availableQuantity <= 0}
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.availableQuantity} {item.unit}</TableCell>
                          <TableCell>₹{item.price}</TableCell>
                          <TableCell>{item.gst_rate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="text-right">
                  <Button 
                    onClick={addSelectedItems} 
                    size="sm"
                    disabled={!Object.values(selectedItems || {}).filter(Boolean).length}
                  >
                    Add Selected Items
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40">
            <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
            <p className="text-gray-500 mb-2">No invoice selected</p>
            <p className="text-sm text-gray-400">Please select an invoice to proceed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceInfo;
