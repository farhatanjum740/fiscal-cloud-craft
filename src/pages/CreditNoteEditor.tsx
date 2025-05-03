
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { CalendarIcon, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CommandSelect } from "@/components/ui/command-select";
import type { CreditNoteItem } from "@/types";

const CreditNoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const invoiceIdFromQuery = queryParams.get('invoiceId');
  const { user } = useAuth();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<{[key: string]: boolean}>({});
  const [showQuantityError, setShowQuantityError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [creditNote, setCreditNote] = useState({
    invoiceId: invoiceIdFromQuery || "",
    creditNoteNumber: "",
    creditNoteDate: new Date(),
    financialYear: "",
    reason: "",
    items: [] as CreditNoteItem[],
    status: "draft",
  });
  
  const [subtotal, setSubtotal] = useState(0);
  const [gstDetails, setGstDetails] = useState({ cgst: 0, sgst: 0, igst: 0 });
  const [total, setTotal] = useState(0);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [invoiceOptions, setInvoiceOptions] = useState<{ value: string, label: string }[]>([]);
  
  // Fetch necessary data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoadingData(true);
      try {
        // Fetch company info (taking the first one for simplicity)
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .single();
          
        if (companyError && companyError.code !== 'PGRST116') {
          throw companyError;
        }
        
        if (companyData) {
          setCompany(companyData);
          
          // Fetch available invoices for credit note
          const { data: invoicesData, error: invoicesError } = await supabase
            .from('invoices')
            .select('id, invoice_number, financial_year, status')
            .eq('user_id', user.id)
            .in('status', ['pending', 'paid'])
            .order('invoice_date', { ascending: false });
            
          if (invoicesError) throw invoicesError;
          
          const options = (invoicesData || []).map(inv => ({
            value: inv.id,
            label: `${inv.invoice_number} (${inv.financial_year})`
          }));
          
          setInvoiceOptions(options);
        }
        
        // If editing existing credit note
        if (isEditing && id) {
          const { data: creditNoteData, error: creditNoteError } = await supabase
            .from('credit_notes')
            .select('*, invoices(*)')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();
            
          if (creditNoteError) throw creditNoteError;
          
          if (creditNoteData) {
            // Fetch credit note items
            const { data: creditNoteItemsData, error: itemsError } = await supabase
              .from('credit_note_items')
              .select('*, invoice_items(*)')
              .eq('credit_note_id', id);
              
            if (itemsError) throw itemsError;
            
            // Transform credit note items to match our type
            const transformedItems: CreditNoteItem[] = (creditNoteItemsData || []).map((item: any) => ({
              id: item.id,
              invoiceItemId: item.invoice_item_id,
              productId: item.product_id || "",
              productName: item.product_name,
              hsnCode: item.hsn_code || "",
              quantity: item.quantity,
              price: item.price,
              unit: item.unit,
              gstRate: item.gst_rate,
            }));
            
            // Set invoice information
            setInvoice(creditNoteData.invoices);
            
            // Set credit note state
            setCreditNote({
              invoiceId: creditNoteData.invoice_id,
              creditNoteNumber: creditNoteData.credit_note_number,
              creditNoteDate: new Date(creditNoteData.credit_note_date),
              financialYear: creditNoteData.financial_year,
              reason: creditNoteData.reason || "",
              items: transformedItems,
              status: creditNoteData.status,
            });
            
            // Load invoice items if we have an invoice ID
            if (creditNoteData.invoice_id) {
              await fetchInvoiceItems(creditNoteData.invoice_id);
            }
          }
        } 
        // If creating a new credit note based on an invoice
        else if (invoiceIdFromQuery) {
          // Fetch invoice data
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', invoiceIdFromQuery)
            .eq('user_id', user.id)
            .single();
            
          if (invoiceError) throw invoiceError;
          
          if (invoiceData) {
            setInvoice(invoiceData);
            
            // Set financial year from invoice
            setCreditNote(prev => ({ 
              ...prev, 
              invoiceId: invoiceData.id,
              financialYear: invoiceData.financial_year
            }));
            
            // Load invoice items
            await fetchInvoiceItems(invoiceData.id);
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
  }, [user, id, isEditing, invoiceIdFromQuery]);
  
  // Fetch invoice items
  const fetchInvoiceItems = async (invoiceId: string) => {
    try {
      // Fetch invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);
        
      if (itemsError) throw itemsError;
      
      // Get credited quantities for each item
      const itemIds = (itemsData || []).map(item => item.id);
      
      let creditedQuantities: {[key: string]: number} = {};
      
      if (itemIds.length > 0) {
        const { data: creditedData, error: creditedError } = await supabase
          .from('credit_note_items')
          .select('invoice_item_id, quantity')
          .in('invoice_item_id', itemIds);
          
        if (creditedError) throw creditedError;
        
        // Sum up quantities by invoice item id
        (creditedData || []).forEach((item: any) => {
          if (!creditedQuantities[item.invoice_item_id]) {
            creditedQuantities[item.invoice_item_id] = 0;
          }
          creditedQuantities[item.invoice_item_id] += Number(item.quantity);
        });
      }
      
      // Add available quantity to each item
      const itemsWithAvailable = (itemsData || []).map(item => {
        const creditedQty = creditedQuantities[item.id] || 0;
        const availableQty = Number(item.quantity) - creditedQty;
        return { ...item, availableQuantity: availableQty };
      });
      
      setInvoiceItems(itemsWithAvailable);
    } catch (error: any) {
      console.error("Error fetching invoice items:", error);
      toast({
        title: "Error",
        description: `Failed to load invoice items: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  // Generate credit note number
  const generateCreditNoteNumber = async () => {
    if (!company || !invoice) {
      toast({
        title: "Error",
        description: "Company profile and invoice are required to generate credit note number",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGeneratingNumber(true);
      
      // Format: CN/INV-NUMBER/001
      const baseInvoiceNumber = invoice.invoice_number.split('/').pop() || invoice.invoice_number;
      const creditNoteNumber = `CN/${invoice.invoice_number}/001`;
      
      setCreditNote(prev => ({
        ...prev,
        creditNoteNumber
      }));
      
      toast({
        title: "Success",
        description: "Credit note number generated successfully",
      });
    } catch (error: any) {
      console.error("Error generating credit note number:", error);
      toast({
        title: "Error",
        description: `Failed to generate credit note number: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingNumber(false);
    }
  };
  
  // Handle invoice selection
  const handleInvoiceChange = async (value: string) => {
    setCreditNote(prev => ({ ...prev, invoiceId: value }));
    
    if (value) {
      // Fetch invoice data
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', value)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setInvoice(data);
          
          // Update financial year to match invoice
          setCreditNote(prev => ({ ...prev, financialYear: data.financial_year }));
          
          // Load invoice items
          await fetchInvoiceItems(data.id);
        }
      } catch (error: any) {
        console.error("Error fetching invoice:", error);
        toast({
          title: "Error",
          description: `Failed to load invoice data: ${error.message}`,
          variant: "destructive",
        });
      }
    } else {
      setInvoice(null);
      setInvoiceItems([]);
    }
  };
  
  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  // Add selected items to credit note
  const addSelectedItems = () => {
    const itemsToAdd = invoiceItems
      .filter(item => selectedItems[item.id])
      .map(item => ({
        id: `temp-${Date.now()}-${item.id}`,
        invoiceItemId: item.id,
        productId: item.product_id || "",
        productName: item.product_name,
        hsnCode: item.hsn_code || "",
        quantity: item.availableQuantity, // Default to max available
        price: item.price,
        unit: item.unit,
        gstRate: item.gst_rate,
        maxQuantity: item.availableQuantity
      }));
      
    setCreditNote(prev => ({
      ...prev,
      items: [...prev.items, ...itemsToAdd]
    }));
    
    // Clear selections
    setSelectedItems({});
  };
  
  // Remove an item from the credit note
  const removeItem = (id: string) => {
    setCreditNote(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };
  
  // Update an item in the credit note
  const updateItem = (id: string, field: keyof CreditNoteItem, value: any) => {
    setCreditNote(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          // For quantity, check if it exceeds maximum
          if (field === "quantity") {
            const maxQty = (item as any).maxQuantity;
            if (maxQty !== undefined && Number(value) > maxQty) {
              setErrorMessage(`Maximum available quantity is ${maxQty}`);
              setShowQuantityError(true);
              return item;
            }
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };
  
  // Calculate totals whenever credit note items change
  useEffect(() => {
    const calcSubtotal = creditNote.items.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    
    setSubtotal(calcSubtotal);
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    if (invoice && company) {
      // Determine whether to use CGST+SGST or IGST based on invoice
      const useIgst = invoice.igst > 0;
      
      creditNote.items.forEach(item => {
        const gstAmount = (item.price * item.quantity * item.gstRate) / 100;
        
        if (useIgst) {
          igst += gstAmount;
        } else {
          cgst += gstAmount / 2;
          sgst += gstAmount / 2;
        }
      });
    }
    
    setGstDetails({ cgst, sgst, igst });
    setTotal(calcSubtotal + cgst + sgst + igst);
    
  }, [creditNote.items, invoice, company]);
  
  // Save credit note
  const saveCreditNote = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save a credit note.",
        variant: "destructive",
      });
      return;
    }
    
    if (!creditNote.invoiceId) {
      toast({
        title: "Error",
        description: "Please select an invoice.",
        variant: "destructive",
      });
      return;
    }
    
    if (creditNote.items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the credit note.",
        variant: "destructive",
      });
      return;
    }

    if (!company) {
      toast({
        title: "Error",
        description: "Please set up your company profile before creating credit notes.",
        variant: "destructive",
      });
      return;
    }
    
    if (!creditNote.creditNoteNumber) {
      toast({
        title: "Error",
        description: "Please generate a credit note number.",
        variant: "destructive",
      });
      return;
    }
    
    if (!creditNote.financialYear) {
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
      const creditNoteDateFormatted = format(creditNote.creditNoteDate, 'yyyy-MM-dd');
      
      // Prepare credit note data
      const creditNoteData = {
        user_id: user.id,
        company_id: company.id,
        invoice_id: creditNote.invoiceId,
        credit_note_number: creditNote.creditNoteNumber,
        credit_note_date: creditNoteDateFormatted,
        financial_year: creditNote.financialYear,
        reason: creditNote.reason,
        subtotal: subtotal,
        cgst: gstDetails.cgst,
        sgst: gstDetails.sgst,
        igst: gstDetails.igst,
        total_amount: total,
        status: creditNote.status,
      };
      
      let creditNoteId: string;
      
      if (isEditing && id) {
        // Update existing credit note
        const { error: updateError } = await supabase
          .from('credit_notes')
          .update(creditNoteData)
          .eq('id', id);
          
        if (updateError) throw updateError;
        creditNoteId = id;
        
        // Delete existing credit note items
        const { error: deleteError } = await supabase
          .from('credit_note_items')
          .delete()
          .eq('credit_note_id', id);
          
        if (deleteError) throw deleteError;
      } else {
        // Insert new credit note
        const { data: insertData, error: insertError } = await supabase
          .from('credit_notes')
          .insert(creditNoteData)
          .select('id')
          .single();
          
        if (insertError) throw insertError;
        if (!insertData) throw new Error("Failed to create credit note");
        
        creditNoteId = insertData.id;
      }
      
      // Insert credit note items
      const creditNoteItemsData = creditNote.items.map(item => ({
        credit_note_id: creditNoteId,
        invoice_item_id: item.invoiceItemId,
        product_id: item.productId || null,
        product_name: item.productName,
        hsn_code: item.hsnCode,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
        gst_rate: item.gstRate,
      }));
      
      const { error: itemsError } = await supabase
        .from('credit_note_items')
        .insert(creditNoteItemsData);
        
      if (itemsError) throw itemsError;
      
      toast({
        title: "Credit Note Saved",
        description: "Your credit note has been saved successfully!",
      });
      
      navigate("/app/invoices");
    } catch (error: any) {
      console.error("Error saving credit note:", error);
      toast({
        title: "Error",
        description: `Failed to save credit note: ${error.message}`,
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
          {isEditing ? "Edit Credit Note" : "Create New Credit Note"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/invoices")} disabled={loading || loadingData}>
            Cancel
          </Button>
          <Button onClick={saveCreditNote} disabled={loading || loadingData}>
            {loading ? "Saving..." : "Save Credit Note"}
          </Button>
        </div>
      </div>
      
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
      
      {loadingData ? (
        <div className="flex justify-center items-center h-32">
          Loading...
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Note Details</CardTitle>
                <CardDescription>
                  Basic information about the credit note
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice">Invoice Reference</Label>
                  <CommandSelect
                    options={invoiceOptions}
                    value={creditNote.invoiceId}
                    onValueChange={handleInvoiceChange}
                    placeholder="Select an invoice"
                    searchPlaceholder="Search invoices..."
                    emptyMessage="No invoices found."
                    disabled={isEditing} // Can't change invoice in edit mode
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="financialYear">Financial Year</Label>
                  <Input
                    id="financialYear"
                    value={creditNote.financialYear}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Financial year is inherited from the selected invoice
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-3">
                    <Label htmlFor="creditNoteNumber">Credit Note Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="creditNoteNumber"
                        value={creditNote.creditNoteNumber}
                        onChange={(e) => setCreditNote(prev => ({ ...prev, creditNoteNumber: e.target.value }))}
                        readOnly={isEditing}
                        className="flex-1"
                      />
                      {!isEditing && invoice && (
                        <Button 
                          variant="outline" 
                          onClick={generateCreditNoteNumber}
                          disabled={isGeneratingNumber || !invoice}
                          className="whitespace-nowrap"
                        >
                          {isGeneratingNumber ? "Generating..." : (
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
                
                <div className="space-y-2">
                  <Label>Credit Note Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !creditNote.creditNoteDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {creditNote.creditNoteDate ? (
                          format(creditNote.creditNoteDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={creditNote.creditNoteDate}
                        onSelect={(date) => date && setCreditNote(prev => ({ ...prev, creditNoteDate: date }))}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Credit Note</Label>
                  <Textarea
                    id="reason"
                    value={creditNote.reason}
                    onChange={(e) => setCreditNote(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="E.g., Goods returned, Quality issues, etc."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={creditNote.status} onValueChange={(value) => setCreditNote(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
                <CardDescription>
                  Details of the invoice against which this credit note is issued
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoice ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md bg-gray-50">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold text-lg">Invoice: {invoice.invoice_number}</h3>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Invoice Date:</p>
                          <p>{new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount:</p>
                          <p>₹{Number(invoice.total_amount).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {!isEditing && invoiceItems.length > 0 && (
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
                              {invoiceItems.map((item) => (
                                <TableRow key={item.id} className={item.availableQuantity <= 0 ? "opacity-50" : ""}>
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
                            disabled={Object.values(selectedItems).filter(Boolean).length === 0}
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
          </div>
          
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
                    {creditNote.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-32">
                          No items added yet. Select invoice items to add to this credit note.
                        </TableCell>
                      </TableRow>
                    ) : (
                      creditNote.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.hsnCode}</TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              min="0.01"
                              max={(item as any).maxQuantity}
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
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate("/app/invoices")} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={saveCreditNote} disabled={loading}>
              {loading ? "Saving..." : "Save Credit Note"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreditNoteEditor;
