import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useInvoice } from "@/hooks/useInvoice";

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

const InvoiceEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    invoice,
    setInvoice,
    loading,
    loadingData,
    customers,
    filteredCustomers,
    products,
    filteredProducts,
    company,
    companySettings,
    financialYears,
    subtotal,
    gstDetails,
    total,
    isGeneratingInvoiceNumber,
    customerSearchQuery,
    setCustomerSearchQuery,
    productSearchQuery,
    setProductSearchQuery,
    addItem,
    removeItem,
    updateItem,
    handleProductSelect,
    handleDateChange,
    generateInvoiceNumber,
    saveInvoice
  } = useInvoice(id);
  
  useEffect(() => {
    if (companySettings) {
      setInvoice(prev => ({
        ...prev,
        termsAndConditions: companySettings.default_terms || "1. Payment is due within 30 days from the date of invoice.\n2. Please include the invoice number as reference when making payment.",
        notes: companySettings.default_notes || ""
      }));
    }
  }, [companySettings, setInvoice]);
  
  // Filter out products that are already in the invoice
  const getAvailableProducts = (currentItemId: string) => {
    return filteredProducts.filter(product => {
      // If the product is already used in another item (not the current one), exclude it
      return !invoice.items.some(item => 
        item.id !== currentItemId && item.productId === product.id
      );
    });
  };
  
  const handleSave = () => {
    if (!invoice.customerId) {
      toast({
        title: "Missing Customer",
        description: "Please select a customer before saving.",
        variant: "destructive",
      });
      return;
    }
    
    if (invoice.items.length === 0) {
      toast({
        title: "Missing Items",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }
    
    saveInvoice();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {id ? "Edit Invoice" : "Create New Invoice"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/invoices")} disabled={loading || loadingData}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || loadingData}>
            {loading ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </div>
      
      {loadingData ? (
        <p>Loading invoice data...</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>
                  Basic information about the invoice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select 
                    onValueChange={(value) => setInvoice(prev => ({ ...prev, customerId: value }))} 
                    value={invoice.customerId || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-background z-10">
                        <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring px-3">
                          <Search className="h-4 w-4 text-muted-foreground mr-2" />
                          <Input 
                            value={customerSearchQuery}
                            onChange={(e) => setCustomerSearchQuery(e.target.value)}
                            placeholder="Search customers..."
                            className="flex h-9 w-full rounded-md border-0 bg-transparent px-0 py-1 text-sm shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                      </div>
                      {filteredCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoice.invoiceNumber}
                      readOnly
                      className="bg-gray-50"
                    />
                    {isGeneratingInvoiceNumber && (
                      <p className="text-xs text-muted-foreground">Generating invoice number...</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="financialYear">Financial Year</Label>
                    <Input
                      id="financialYear"
                      value={invoice.financialYear}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <DatePicker
                      selected={invoice.invoiceDate}
                      onSelect={(date) => handleDateChange(date)}
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                      disableFutureDates={true}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <DatePicker
                      selected={invoice.dueDate}
                      onSelect={(date) => setInvoice(prev => ({ ...prev, dueDate: date }))}
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
                
                {/* Add invoice status selection */}
                <div>
                  <Label htmlFor="status">Invoice Status</Label>
                  <Select 
                    onValueChange={(value) => setInvoice(prev => ({ ...prev, status: value }))} 
                    value={invoice.status || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Terms, notes, and other details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    value={invoice.termsAndConditions || ""}
                    onChange={(e) => setInvoice(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    placeholder="Terms and conditions..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={invoice.notes || ""}
                    onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
              <CardDescription>
                List of items included in this invoice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>HSN Code</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>GST Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select 
                          onValueChange={(value) => handleProductSelect(item.id, value)} 
                          value={item.productId || ""}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            <div className="p-2 sticky top-0 bg-background z-10">
                              <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring px-3">
                                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                                <Input 
                                  value={productSearchQuery}
                                  onChange={(e) => setProductSearchQuery(e.target.value)}
                                  placeholder="Search products..."
                                  className="flex h-9 w-full rounded-md border-0 bg-transparent px-0 py-1 text-sm shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                              </div>
                            </div>
                            {/* Filter out products that are already selected in other rows */}
                            {getAvailableProducts(item.id).map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                            {/* Show the currently selected product even if it's used elsewhere */}
                            {item.productId && !getAvailableProducts(item.id).some(p => p.id === item.productId) && 
                              products.find(p => p.id === item.productId) && (
                                <SelectItem key={item.productId} value={item.productId}>
                                  {products.find(p => p.id === item.productId)?.name}
                                </SelectItem>
                              )
                            }
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.hsnCode || ""}
                          onChange={(e) => updateItem(item.id, "hsnCode", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={String(item.quantity || "")}
                          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
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
                          value={String(item.price || "")}
                          onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={String(item.gstRate || "")}
                          onChange={(e) => updateItem(item.id, "gstRate", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button size="sm" className="mt-4" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-2">
            <div>Subtotal: ₹{subtotal.toLocaleString()}</div>
            <div>GST: ₹{gstDetails.cgst + gstDetails.sgst + gstDetails.igst}</div>
            <div>Total: ₹{total.toLocaleString()}</div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate("/app/invoices")} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Invoice"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceEditor;
