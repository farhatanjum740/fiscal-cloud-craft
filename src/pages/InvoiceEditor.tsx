
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import type { InvoiceItem } from "@/types";

// Mock data for customers and products
const mockCustomers = [
  { id: "c1", name: "ABC Technologies" },
  { id: "c2", name: "XYZ Corp" },
  { id: "c3", name: "Global Solutions" },
];

const mockProducts = [
  { id: "p1", name: "Web Development", price: 5000, hsnCode: "998313", gstRate: 18, unit: "hour" },
  { id: "p2", name: "Mobile App Development", price: 7500, hsnCode: "998314", gstRate: 18, unit: "hour" },
  { id: "p3", name: "Hosting Services", price: 1200, hsnCode: "998315", gstRate: 18, unit: "month" },
  { id: "p4", name: "Domain Registration", price: 800, hsnCode: "998316", gstRate: 18, unit: "year" },
  { id: "p5", name: "SEO Services", price: 3500, hsnCode: "998317", gstRate: 18, unit: "month" },
];

// Mock company details
const mockCompany = {
  id: "comp1",
  name: "My Business",
  gstin: "27AAAAA0000A1Z5",
  address: {
    line1: "123 Business Park",
    line2: "Tech Hub",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001"
  },
  bankDetails: {
    accountName: "My Business",
    accountNumber: "1234567890",
    bankName: "State Bank of India",
    ifscCode: "SBIN0000123",
    branch: "Mumbai Main"
  }
};

const InvoiceEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [invoice, setInvoice] = useState({
    customerId: "",
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    items: [] as InvoiceItem[],
    termsAndConditions: "1. Payment is due within 30 days from the date of invoice.\n2. Please include the invoice number as reference when making payment.",
    notes: "",
  });
  
  const [subtotal, setSubtotal] = useState(0);
  const [gstDetails, setGstDetails] = useState({ cgst: 0, sgst: 0, igst: 0 });
  const [total, setTotal] = useState(0);
  
  // Calculate totals whenever invoice items change
  useEffect(() => {
    const calcSubtotal = invoice.items.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    
    setSubtotal(calcSubtotal);
    
    // For demo, assume Maharashtra is the state of business (intra-state GST)
    // In a real app, compare customer state with business state
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    invoice.items.forEach(item => {
      const gstAmount = (item.price * item.quantity * item.gstRate) / 100;
      // For intra-state (same state)
      cgst += gstAmount / 2;
      sgst += gstAmount / 2;
      // For inter-state, would use igst instead
      // igst += gstAmount;
    });
    
    setGstDetails({ cgst, sgst, igst });
    setTotal(calcSubtotal + cgst + sgst + igst);
    
  }, [invoice.items]);
  
  // Add a new item to the invoice
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      productId: "",
      productName: "",
      quantity: 1,
      price: 0,
      hsnCode: "",
      gstRate: 18,
      unit: "",
    };
    
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };
  
  // Remove an item from the invoice
  const removeItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };
  
  // Update an item in the invoice
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };
  
  // Handle product selection
  const handleProductSelect = (id: string, productId: string) => {
    const selectedProduct = mockProducts.find(p => p.id === productId);
    if (selectedProduct) {
      updateItem(id, "productId", productId);
      updateItem(id, "productName", selectedProduct.name);
      updateItem(id, "price", selectedProduct.price);
      updateItem(id, "hsnCode", selectedProduct.hsnCode);
      updateItem(id, "gstRate", selectedProduct.gstRate);
      updateItem(id, "unit", selectedProduct.unit);
    }
  };
  
  // Save invoice
  const saveInvoice = () => {
    // In a real app, this would save to the database
    console.log("Saving invoice:", invoice);
    toast({
      title: "Invoice Saved",
      description: "Your invoice has been saved successfully!",
    });
    navigate("/app/invoices");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Invoice" : "Create New Invoice"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/invoices")}>
            Cancel
          </Button>
          <Button onClick={saveInvoice}>
            Save Invoice
          </Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>
              Basic information about the invoice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoice.invoiceNumber}
                onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !invoice.invoiceDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {invoice.invoiceDate ? (
                        format(invoice.invoiceDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={invoice.invoiceDate}
                      onSelect={(date) => date && setInvoice(prev => ({ ...prev, invoiceDate: date }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !invoice.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {invoice.dueDate ? (
                        format(invoice.dueDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={invoice.dueDate}
                      onSelect={(date) => date && setInvoice(prev => ({ ...prev, dueDate: date }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select 
                value={invoice.customerId} 
                onValueChange={(value) => setInvoice(prev => ({ ...prev, customerId: value }))}
              >
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Your business details that will appear on the invoice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="font-semibold text-lg">{mockCompany.name}</h3>
                <p className="text-sm text-gray-600">
                  {mockCompany.address.line1}<br />
                  {mockCompany.address.line2 && `${mockCompany.address.line2}, `}
                  {mockCompany.address.city}, {mockCompany.address.state} - {mockCompany.address.pincode}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  GSTIN: {mockCompany.gstin}
                </p>
              </div>
              <div className="text-center">
                <Button variant="link" size="sm">
                  Edit Company Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Invoice Items</span>
            <Button size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
          <CardDescription>
            Add products or services to this invoice
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                {invoice.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32">
                      No items added yet. Click "Add Item" to add products or services.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select 
                          value={item.productId} 
                          onValueChange={(value) => handleProductSelect(item.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.hsnCode} 
                          onChange={(e) => updateItem(item.id, "hsnCode", e.target.value)} 
                          className="w-[100px]" 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min="1"
                          value={item.quantity} 
                          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} 
                          className="w-[80px]" 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.unit} 
                          onChange={(e) => updateItem(item.id, "unit", e.target.value)} 
                          className="w-[80px]" 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min="0"
                          value={item.price} 
                          onChange={(e) => updateItem(item.id, "price", Number(e.target.value))} 
                          className="w-[100px]" 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min="0"
                          value={item.gstRate} 
                          onChange={(e) => updateItem(item.id, "gstRate", Number(e.target.value))} 
                          className="w-[80px]" 
                        />
                      </TableCell>
                      <TableCell>
                        {(item.price * item.quantity).toFixed(2)}
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
              <div className="flex justify-between">
                <span className="text-gray-600">CGST:</span>
                <span>₹{gstDetails.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SGST:</span>
                <span>₹{gstDetails.sgst.toFixed(2)}</span>
              </div>
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
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              rows={4}
              value={invoice.termsAndConditions}
              onChange={(e) => setInvoice(prev => ({ ...prev, termsAndConditions: e.target.value }))}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              rows={4}
              placeholder="Additional notes to be displayed on the invoice (optional)"
              value={invoice.notes}
              onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/app/invoices")}>
          Cancel
        </Button>
        <Button onClick={saveInvoice}>
          Save Invoice
        </Button>
      </div>
    </div>
  );
};

export default InvoiceEditor;
