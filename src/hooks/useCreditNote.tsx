
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { CreditNoteItem } from "@/types";

export const useCreditNote = (id?: string) => {
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
  const [invoiceOptions, setInvoiceOptions] = useState<{ value: string, label: string }[]>([]);
  
  const [creditNote, setCreditNote] = useState({
    invoiceId: "",
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
  
  // Fetch necessary data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoadingData(true);
      try {
        console.log("Fetching data for useCreditNote, user:", user.id);
        
        // Fetch company info
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
          console.log("Company data fetched:", companyData);
          setCompany(companyData);
          
          // Fetch available invoices for credit note
          const { data: invoicesData, error: invoicesError } = await supabase
            .from('invoices')
            .select('id, invoice_number, financial_year, status')
            .eq('user_id', user.id)
            .in('status', ['pending', 'paid']);
            
          if (invoicesError) throw invoicesError;
          
          console.log("Invoices data fetched:", invoicesData);
          
          // Convert to options format and ensure we have valid data
          let options: { value: string, label: string }[] = [];
          
          if (Array.isArray(invoicesData) && invoicesData.length > 0) {
            options = invoicesData
              .filter(inv => inv && inv.id && inv.invoice_number)
              .map(inv => ({
                value: inv.id || "",
                label: `${inv.invoice_number || "Unknown"} (${inv.financial_year || "Unknown"})`
              }));
          }
            
          console.log("Invoice options created:", options);
          setInvoiceOptions(options);
        }
        
        // If editing existing credit note
        if (isEditing && id) {
          console.log("Editing existing credit note, id:", id);
          try {
            const { data: creditNoteData, error: creditNoteError } = await supabase
              .from('credit_notes')
              .select('*, invoices(*)')
              .eq('id', id)
              .eq('user_id', user.id)
              .maybeSingle(); // Use maybeSingle instead of single to handle not found
              
            if (creditNoteError) throw creditNoteError;
            
            console.log("Credit note data fetched:", creditNoteData);
            
            if (creditNoteData) {
              // Fetch credit note items
              const { data: creditNoteItemsData, error: itemsError } = await supabase
                .from('credit_note_items')
                .select('*, invoice_items(*)')
                .eq('credit_note_id', id);
                
              if (itemsError) throw itemsError;
              
              console.log("Credit note items fetched:", creditNoteItemsData);
              
              // Transform credit note items to match our type
              const transformedItems: CreditNoteItem[] = Array.isArray(creditNoteItemsData) 
                ? creditNoteItemsData.map((item: any) => ({
                    id: item.id || `temp-${Date.now()}-${Math.random()}`,
                    invoiceItemId: item.invoice_item_id || "",
                    productId: item.product_id || "",
                    productName: item.product_name || "",
                    hsnCode: item.hsn_code || "",
                    quantity: item.quantity || 0,
                    price: item.price || 0,
                    unit: item.unit || "",
                    gstRate: item.gst_rate || 0,
                  }))
                : [];
              
              // Set invoice information
              setInvoice(creditNoteData.invoices);
              
              // Set credit note state
              setCreditNote({
                invoiceId: creditNoteData.invoice_id || "",
                creditNoteNumber: creditNoteData.credit_note_number || "",
                creditNoteDate: new Date(creditNoteData.credit_note_date),
                financialYear: creditNoteData.financial_year || "",
                reason: creditNoteData.reason || "",
                items: transformedItems,
                status: creditNoteData.status || "draft",
              });
              
              // Load invoice items if we have an invoice ID
              if (creditNoteData.invoice_id) {
                await fetchInvoiceItems(creditNoteData.invoice_id);
              }
            } else {
              console.log("Credit note not found");
              toast({
                title: "Credit Note Not Found",
                description: "The requested credit note could not be found.",
                variant: "destructive",
              });
            }
          } catch (error: any) {
            console.error("Error fetching credit note:", error);
            toast({
              title: "Error",
              description: `Failed to load credit note: ${error.message}`,
              variant: "destructive",
            });
          }
        } 
        // If creating a new credit note based on an invoice
        else if (id) {
          console.log("Creating new credit note based on invoice ID:", id);
          // Update creditNote state with the invoiceId
          setCreditNote(prev => ({ ...prev, invoiceId: id }));
          
          // Fetch invoice data
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .maybeSingle(); // Use maybeSingle to avoid errors if not found
            
          if (invoiceError) throw invoiceError;
          
          console.log("Invoice data fetched:", invoiceData);
          
          if (invoiceData) {
            setInvoice(invoiceData);
            
            // Set financial year from invoice
            setCreditNote(prev => ({ 
              ...prev, 
              invoiceId: invoiceData.id || "",
              financialYear: invoiceData.financial_year || ""
            }));
            
            // Load invoice items
            await fetchInvoiceItems(invoiceData.id);
          } else {
            console.log("Invoice not found");
            toast({
              title: "Invoice Not Found",
              description: "The requested invoice could not be found.",
              variant: "destructive",
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
  
  // Fetch invoice items
  const fetchInvoiceItems = async (invoiceId: string) => {
    try {
      console.log("Fetching invoice items for invoice ID:", invoiceId);
      
      // Fetch invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);
        
      if (itemsError) throw itemsError;
      
      console.log("Invoice items data:", itemsData);
      
      // Get credited quantities for each item
      const itemIds = (itemsData || []).map(item => item.id);
      
      let creditedQuantities: {[key: string]: number} = {};
      
      if (itemIds.length > 0) {
        const { data: creditedData, error: creditedError } = await supabase
          .from('credit_note_items')
          .select('invoice_item_id, quantity')
          .in('invoice_item_id', itemIds);
          
        if (creditedError) throw creditedError;
        
        console.log("Credited quantities data:", creditedData);
        
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
      
      console.log("Items with available quantities:", itemsWithAvailable);
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
      
      // Format: CN/INV-NUMBER (without the redundant 001 suffix)
      const creditNoteNumber = `CN/${invoice.invoice_number}`;
      
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
    console.log("Invoice changed to:", value);
    setCreditNote(prev => ({ ...prev, invoiceId: value }));
    
    if (value) {
      // Fetch invoice data
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', value)
          .maybeSingle(); // Use maybeSingle to avoid errors if not found
          
        if (error) throw error;
        
        console.log("Selected invoice data:", data);
        
        if (data) {
          setInvoice(data);
          
          // Update financial year to match invoice
          setCreditNote(prev => ({ ...prev, financialYear: data.financial_year || "" }));
          
          // Load invoice items
          await fetchInvoiceItems(data.id);
        } else {
          console.log("Invoice not found");
          toast({
            title: "Invoice Not Found",
            description: "The selected invoice could not be found.",
            variant: "destructive",
          });
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
        productName: item.product_name || item.productName, // Use the correct field based on what's available
        hsnCode: item.hsn_code || item.hsnCode || "", // Use the correct field based on what's available
        quantity: item.availableQuantity, // Default to max available
        price: item.price,
        unit: item.unit,
        gstRate: item.gst_rate || item.gstRate, // Use the correct field based on what's available
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
  const saveCreditNote = async (navigate: (path: string) => void) => {
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

  return {
    creditNote,
    setCreditNote,
    loading,
    loadingData,
    invoice,
    invoiceItems,
    company,
    selectedItems,
    showQuantityError,
    setShowQuantityError,
    errorMessage,
    invoiceOptions,
    subtotal,
    gstDetails,
    total,
    isGeneratingNumber,
    handleInvoiceChange,
    toggleItemSelection,
    addSelectedItems,
    removeItem,
    updateItem,
    generateCreditNoteNumber,
    saveCreditNote
  };
};
