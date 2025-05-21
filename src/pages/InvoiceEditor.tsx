
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
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="Search customers..."
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        className="pr-8"
                      />
                      <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <Select 
                      onValueChange={(value) => setInvoice(prev => ({ ...prev, customerId: value }))} 
                      value={invoice.customerId || ""}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {filteredCustomers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
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
                        <div className="space-y-2">
                          <div className="relative">
                            <Input
                              placeholder="Search products..."
                              value={productSearchQuery}
                              onChange={(e) => setProductSearchQuery(e.target.value)}
                              className="pr-8 mb-2"
                            />
                            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                          <Select 
                            onValueChange={(value) => handleProductSelect(item.id, value)} 
                            value={item.productId || ""}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
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
                        </div>
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
                        <Input
                          type="text"
                          value={item.unit || ""}
                          onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                        />
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
