
import { useState, useEffect } from "react";
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
import { CalendarIcon, Plus, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CommandSelect } from "@/components/ui/command-select";
import type { InvoiceItem } from "@/types";
import { mapInvoiceItemToFrontend, mapFrontendToInvoiceItem } from "@/types/supabase-types";

const InvoiceEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [financialYears, setFinancialYears] = useState<string[]>([]);
  
  const [invoice, setInvoice] = useState({
    customerId: "",
    invoiceNumber: "",
    invoiceDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    items: [] as InvoiceItem[],
    termsAndConditions: "1. Payment is due within 30 days from the date of invoice.\n2. Please include the invoice number as reference when making payment.",
    notes: "",
    status: "draft",
    financialYear: "",
    invoicePrefix: "",
  });
  
  const [subtotal, setSubtotal] = useState(0);
  const [gstDetails, setGstDetails] = useState({ cgst: 0, sgst: 0, igst: 0 });
  const [total, setTotal] = useState(0);
  const [isGeneratingInvoiceNumber, setIsGeneratingInvoiceNumber] = useState(false);
  
  // Generate list of financial years (current ± 5 years)
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const startYear = currentMonth >= 3 ? currentYear - 5 : currentYear - 6;
    const endYear = currentMonth >= 3 ? currentYear + 1 : currentYear;
    
    const years: string[] = [];
    for (let i = startYear; i <= endYear; i++) {
      years.push(`${i}-${i + 1}`);
    }
    
    setFinancialYears(years.reverse());
    
    // Set default financial year
    const defaultFinancialYear = getCurrentFinancialYear(currentDate);
    setInvoice(prev => ({ ...prev, financialYear: defaultFinancialYear }));
  }, []);
  
  // Get current financial year
  const getCurrentFinancialYear = (date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    if (month >= 3) { // April to March
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };
  
  // Fetch customers, products, company data, and company settings
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoadingData(true);
      try {
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id);
          
        if (customersError) throw customersError;
        setCustomers(customersData || []);
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id);
          
        if (productsError) throw productsError;
        setProducts(productsData || []);
        
        // Fetch company info (taking the first one for simplicity)
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .single();
          
        if (companyError && companyError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which we can handle
          throw companyError;
        }
        
        if (companyData) {
          setCompany(companyData);
          
          // Fetch company settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('company_settings')
            .select('*')
            .eq('company_id', companyData.id)
            .maybeSingle();
            
          if (settingsError) throw settingsError;
          
          if (settingsData) {
            setCompanySettings(settingsData);
            setInvoice(prev => ({ 
              ...prev, 
              financialYear: settingsData.current_financial_year,
              invoicePrefix: settingsData.invoice_prefix || ""
            }));
          }
        }
        
        // If editing, fetch invoice data
        if (isEditing && id) {
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();
            
          if (invoiceError) throw invoiceError;
          
          if (invoiceData) {
            // Fetch invoice items
            const { data: invoiceItemsData, error: invoiceItemsError } = await supabase
              .from('invoice_items')
              .select('*')
              .eq('invoice_id', id);
              
            if (invoiceItemsError) throw invoiceItemsError;
            
            // Transform invoice items data to match our InvoiceItem type
            const transformedItems: InvoiceItem[] = (invoiceItemsData || []).map((item: any) => ({
              id: item.id,
              productId: item.product_id || "",
              productName: item.product_name,
              description: item.description || "",
              hsnCode: item.hsn_code || "",
              quantity: item.quantity,
              price: item.price,
              unit: item.unit,
              gstRate: item.gst_rate,
              discountRate: item.discount_rate,
            }));
            
            // Set invoice state
            setInvoice({
              customerId: invoiceData.customer_id,
              invoiceNumber: invoiceData.invoice_number,
              invoiceDate: new Date(invoiceData.invoice_date),
              dueDate: invoiceData.due_date ? new Date(invoiceData.due_date) : new Date(new Date().setDate(new Date().getDate() + 30)),
              items: transformedItems,
              termsAndConditions: invoiceData.terms_and_conditions || "1. Payment is due within 30 days from the date of invoice.\n2. Please include the invoice number as reference when making payment.",
              notes: invoiceData.notes || "",
              status: invoiceData.status,
              financialYear: invoiceData.financial_year,
              invoicePrefix: invoiceData.invoice_prefix || "",
            });
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: `Failed to load data: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [user, id, isEditing]);
  
  // Generate invoice number
  const generateInvoiceNumber = async () => {
    if (!company) {
      toast({
        title: "Error",
        description: "Company profile is required to generate invoice number",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGeneratingInvoiceNumber(true);
      
      // Call the database function to get a new invoice number
      const { data, error } = await supabase
        .rpc('get_next_invoice_number', {
          p_company_id: company.id,
          p_financial_year: invoice.financialYear,
          p_prefix: invoice.invoicePrefix || ""
        });
      
      if (error) throw error;
      
      setInvoice(prev => ({
        ...prev,
        invoiceNumber: data
      }));
      
      toast({
        title: "Success",
        description: "Invoice number generated successfully",
      });
    } catch (error: any) {
      console.error("Error generating invoice number:", error);
      toast({
        title: "Error",
        description: `Failed to generate invoice number: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInvoiceNumber(false);
    }
  };
  
  // Get customer by ID
  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };
  
  // Calculate totals whenever invoice items change or customer changes
  useEffect(() => {
    const calcSubtotal = invoice.items.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    
    setSubtotal(calcSubtotal);
    
    // Get customer and determine if we should use CGST+SGST or IGST
    const customer = getCustomerById(invoice.customerId);
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    invoice.items.forEach(item => {
      const gstAmount = (item.price * item.quantity * item.gstRate) / 100;
      
      if (customer && company) {
        // Compare customer's shipping state with company's state
        // If they match, use CGST+SGST, otherwise use IGST
        if (customer.shipping_state === company.state) {
          // Intra-state: Use CGST + SGST
          cgst += gstAmount / 2;
          sgst += gstAmount / 2;
        } else {
          // Inter-state: Use IGST
          igst += gstAmount;
        }
      } else {
        // Default to intra-state if customer or company not found
        cgst += gstAmount / 2;
        sgst += gstAmount / 2;
      }
    });
    
    setGstDetails({ cgst, sgst, igst });
    setTotal(calcSubtotal + cgst + sgst + igst);
    
  }, [invoice.items, invoice.customerId, customers, company]);
  
  // Handle financial year change
  const handleFinancialYearChange = (year: string) => {
    setInvoice(prev => ({ ...prev, financialYear: year }));
    
    // Clear invoice number if changing financial year
    if (year !== invoice.financialYear) {
      setInvoice(prev => ({ ...prev, invoiceNumber: "" }));
    }
  };
  
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
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      updateItem(id, "productId", productId);
      updateItem(id, "productName", selectedProduct.name);
      updateItem(id, "price", selectedProduct.price);
      updateItem(id, "hsnCode", selectedProduct.hsn_code);
      updateItem(id, "gstRate", selectedProduct.gst_rate);
      updateItem(id, "unit", selectedProduct.unit);
    }
  };
  
  // Save invoice
  const saveInvoice = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save an invoice.",
        variant: "destructive",
      });
      return;
    }
    
    if (!invoice.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }
    
    if (invoice.items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    if (!company) {
      toast({
        title: "Error",
        description: "Please set up your company profile before creating invoices.",
        variant: "destructive",
      });
      return;
    }
    
    if (!invoice.invoiceNumber) {
      toast({
        title: "Error",
        description: "Please generate an invoice number.",
        variant: "destructive",
      });
      return;
    }
    
    if (!invoice.financialYear) {
      toast({
        title: "Error",
        description: "Please select a financial year.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Format date for SQL
      const invoiceDateFormatted = format(invoice.invoiceDate, 'yyyy-MM-dd');
      const dueDateFormatted = invoice.dueDate ? format(invoice.dueDate, 'yyyy-MM-dd') : null;
      
      // Prepare invoice data
      const invoiceData = {
        user_id: user.id,
        customer_id: invoice.customerId,
        company_id: company.id,
        invoice_number: invoice.invoiceNumber,
        invoice_date: invoiceDateFormatted,
        due_date: dueDateFormatted,
        subtotal: subtotal,
        cgst: gstDetails.cgst,
        sgst: gstDetails.sgst,
        igst: gstDetails.igst,
        total_amount: total,
        status: invoice.status,
        terms_and_conditions: invoice.termsAndConditions,
        notes: invoice.notes,
        financial_year: invoice.financialYear,
        invoice_prefix: invoice.invoicePrefix
      };
      
      let invoiceId: string;
      
      if (isEditing && id) {
        // Update existing invoice
        const { error: updateError } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', id);
          
        if (updateError) throw updateError;
        invoiceId = id;
        
        // Delete existing invoice items
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);
          
        if (deleteError) throw deleteError;
      } else {
        // Insert new invoice
        const { data: insertData, error: insertError } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select('id')
          .single();
          
        if (insertError) throw insertError;
        if (!insertData) throw new Error("Failed to create invoice");
        
        invoiceId = insertData.id;
      }
      
      // Insert invoice items
      const invoiceItemsData = invoice.items.map(item => ({
        invoice_id: invoiceId,
        product_id: item.productId || null,
        product_name: item.productName,
        description: item.description,
        hsn_code: item.hsnCode,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
        gst_rate: item.gstRate,
        discount_rate: item.discountRate,
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItemsData);
        
      if (itemsError) throw itemsError;
      
      // Update company settings with the current financial year and invoice prefix
      if (companySettings) {
        const { error: settingsError } = await supabase
          .from('company_settings')
          .update({
            current_financial_year: invoice.financialYear,
            invoice_prefix: invoice.invoicePrefix,
            updated_at: new Date().toISOString()
          })
          .eq('id', companySettings.id);
          
        if (settingsError) throw settingsError;
      } else if (company) {
        // Create company settings if they don't exist
        const { error: createSettingsError } = await supabase
          .from('company_settings')
          .insert({
            company_id: company.id,
            user_id: user.id,
            current_financial_year: invoice.financialYear,
            invoice_prefix: invoice.invoicePrefix,
            invoice_counter: 1
          });
          
        if (createSettingsError) throw createSettingsError;
      }
      
      toast({
        title: "Invoice Saved",
        description: "Your invoice has been saved successfully!",
      });
      
      navigate("/app/invoices");
    } catch (error: any) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: `Failed to save invoice: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Invoice" : "Create New Invoice"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/invoices")} disabled={loading || loadingData}>
            Cancel
          </Button>
          <Button onClick={saveInvoice} disabled={loading || loadingData}>
            {loading ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </div>
      
      {loadingData ? (
        <div className="flex justify-center items-center h-32">
          Loading...
        </div>
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
                <div className="space-y-2">
                  <Label htmlFor="financialYear">Financial Year</Label>
                  <Select 
                    value={invoice.financialYear} 
                    onValueChange={handleFinancialYearChange}
                  >
                    <SelectTrigger id="financialYear">
                      <SelectValue placeholder="Select financial year" />
                    </SelectTrigger>
                    <SelectContent>
                      {financialYears.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                    <Input
                      id="invoicePrefix"
                      value={invoice.invoicePrefix}
                      onChange={(e) => setInvoice(prev => ({ ...prev, invoicePrefix: e.target.value }))}
                      placeholder="INV"
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="invoiceNumber"
                        value={invoice.invoiceNumber}
                        onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                        readOnly={isEditing}
                        className="flex-1"
                      />
                      {!isEditing && (
                        <Button 
                          variant="outline" 
                          onClick={generateInvoiceNumber}
                          disabled={isGeneratingInvoiceNumber || !invoice.financialYear}
                          className="whitespace-nowrap"
                        >
                          {isGeneratingInvoiceNumber ? "Generating..." : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Generate
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
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
                  <CommandSelect
                    options={customers.map(customer => ({ 
                      value: customer.id, 
                      label: customer.name 
                    }))}
                    value={invoice.customerId}
                    onValueChange={(value) => setInvoice(prev => ({ ...prev, customerId: value }))}
                    placeholder="Select a customer"
                    searchPlaceholder="Search customers..."
                    emptyMessage="No customers found."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={invoice.status} onValueChange={(value) => setInvoice(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
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
                {company ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md bg-gray-50">
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <p className="text-sm text-gray-600">
                        {company.address_line1}<br />
                        {company.address_line2 && `${company.address_line2}, `}
                        {company.city}, {company.state} - {company.pincode}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        GSTIN: {company.gstin || "Not provided"}
                      </p>
                    </div>
                    <div className="text-center">
                      <Button variant="link" size="sm" onClick={() => navigate("/app/company-profile")}>
                        Edit Company Profile
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <p className="text-gray-500 mb-4">No company profile found</p>
                    <Button onClick={() => navigate("/app/company-profile")}>
                      Create Company Profile
                    </Button>
                  </div>
                )}
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
                            <CommandSelect
                              options={products.map(product => ({ 
                                value: product.id, 
                                label: product.name 
                              }))}
                              value={item.productId || ""}
                              onValueChange={(value) => handleProductSelect(item.id, value)}
                              placeholder="Select product"
                              searchPlaceholder="Search products..."
                              emptyMessage="No products found."
                              className="w-[180px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={item.hsnCode || ""} 
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
                              value={item.unit || ""} 
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
            <Button variant="outline" onClick={() => navigate("/app/invoices")} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={saveInvoice} disabled={loading}>
              {loading ? "Saving..." : "Save Invoice"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceEditor;
