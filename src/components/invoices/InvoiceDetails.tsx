
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { formatCurrency } from "@/lib/utils";
import { useInvoice } from "@/hooks/useInvoice";

interface InvoiceDetailsProps {
  id?: string;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ id }) => {
  const navigate = useNavigate();
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
  
  // Filter out products that are already in the invoice
  const getAvailableProducts = (currentItemId: string) => {
    return filteredProducts.filter(product => {
      // If the product is already used in another item (not the current one), exclude it
      return !invoice.items.some(item => 
        item.id !== currentItemId && item.productId === product.id
      );
    });
  };
  
  useEffect(() => {
    if (companySettings) {
      setInvoice(prev => ({
        ...prev,
        termsAndConditions: companySettings.terms_and_conditions,
        notes: companySettings.notes
      }));
    }
  }, [companySettings, setInvoice]);
  
  if (loadingData) {
    return <div className="text-center p-4">Loading...</div>;
  }
  
  // Calculate total GST
  const totalGst = gstDetails.cgst + gstDetails.sgst + gstDetails.igst;
  
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Invoice Details</CardTitle>
          <CardDescription>
            Fill in the details for the invoice.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <div className="relative">
                <Input
                  id="invoiceNumber"
                  value={invoice.invoiceNumber || "Generating..."}
                  disabled={true}
                />
                <Button
                  type="button"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  onClick={generateInvoiceNumber}
                  disabled={isGeneratingInvoiceNumber}
                >
                  {isGeneratingInvoiceNumber ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <DatePicker
                selected={invoice.invoiceDate}
                onSelect={(date) => handleDateChange(date)}
                disabled={loading}
                placeholder="Select invoice date"
                disableFutureDates={true}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <DatePicker
                selected={invoice.dueDate}
                onSelect={(date) => setInvoice(prev => ({ ...prev, dueDate: date }))}
                disabled={loading}
                placeholder="Select due date"
              />
            </div>
            <div>
              <Label htmlFor="financialYear">Financial Year</Label>
              <Select
                onValueChange={(value) => setInvoice(prev => ({ ...prev, financialYear: value }))}
                defaultValue={invoice.financialYear}
                disabled={true}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select financial year" />
                </SelectTrigger>
                <SelectContent>
                  {financialYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  defaultValue={invoice.customerId}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Add status selection dropdown */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => setInvoice(prev => ({ ...prev, status: value }))}
                defaultValue={invoice.status || "draft"}
                disabled={loading}
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
          </div>
          
          <Separator />
          
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>HSN Code</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">GST Rate</TableHead>
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
                            className="pr-8"
                          />
                          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        <Select
                          onValueChange={(productId) => handleProductSelect(item.id, productId)}
                          defaultValue={item.productId}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
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
                        value={item.quantity || ""}
                        onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value))}
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
                        value={item.price || ""}
                        onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell className="text-right">{item.gstRate}%</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={7}>
                    <Button type="button" size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Invoice notes"
                value={invoice.notes || ""}
                onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                placeholder="Terms & conditions"
                value={invoice.termsAndConditions || ""}
                onChange={(e) => setInvoice(prev => ({ ...prev, termsAndConditions: e.target.value }))}
              />
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Subtotal:</Label>
                <p>{formatCurrency(subtotal)}</p>
              </div>
              <div>
                <Label>GST Total:</Label>
                <p>{formatCurrency(totalGst)}</p>
              </div>
              <div>
                <Label>Total:</Label>
                <p>{formatCurrency(total)}</p>
              </div>
            </div>
          </div>
          
          <Button onClick={saveInvoice} disabled={loading}>
            {loading ? "Saving..." : "Save Invoice"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDetails;
