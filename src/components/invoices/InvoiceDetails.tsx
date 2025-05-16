
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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommandSelect } from "@/components/ui/command-select";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { formatCurrency } from "@/lib/utils";
import { useInvoice } from "@/hooks/useInvoice";
import InvoiceItemRow from "./invoice-items/InvoiceItemRow";

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
    products,
    company,
    companySettings,
    financialYears,
    subtotal,
    gstDetails,
    total,
    isGeneratingInvoiceNumber,
    addItem,
    removeItem,
    updateItem,
    handleProductSelect,
    handleDateChange,
    generateInvoiceNumber,
    saveInvoice
  } = useInvoice(id);
  
  // Convert customers to format needed for CommandSelect
  const customerOptions = customers.map(customer => ({
    value: customer.id,
    label: customer.name
  }));
  
  // Calculate total GST
  const totalGst = gstDetails.cgst + gstDetails.sgst + gstDetails.igst;
  
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
  
  // Convert products to format needed for CommandSelect
  const productOptions = products.map(product => ({
    value: product.id,
    label: product.name
  }));
  
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
              <CommandSelect
                options={customerOptions}
                value={invoice.customerId}
                onValueChange={(value) => setInvoice(prev => ({ ...prev, customerId: value }))}
                placeholder="Select customer"
                searchInputPlaceholder="Search customers..."
                emptyMessage="No customers found."
                disabled={loading}
              />
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
                  <InvoiceItemRow
                    key={item.id}
                    item={item}
                    productOptions={productOptions}
                    updateItem={updateItem}
                    removeItem={removeItem}
                    handleProductSelect={handleProductSelect}
                  />
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
