import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CreditNoteData, InvoiceOption } from "./types";
import { v4 as uuidv4 } from "uuid";

export const useFetchCreditNoteData = (
  userId: string | undefined,
  id?: string,
  isEditing = false
) => {
  const [loadingData, setLoadingData] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [invoiceOptions, setInvoiceOptions] = useState<{ value: string; label: string }[]>([]);
  const [creditNote, setCreditNote] = useState<CreditNoteData>({
    invoiceId: "",
    creditNoteNumber: "",
    creditNoteDate: new Date(),
    financialYear: "",
    reason: "",
    status: "issued", // Set default status to "issued"
    items: []
  });

  // Fetch necessary data
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      setLoadingData(true);
      try {
        console.log("Fetching data for useCreditNote, user:", userId);
        
        // Fetch company info
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', userId)
          .limit(1)
          .single();
          
        if (companyError && companyError.code !== 'PGRST116') {
          throw companyError;
        }
        
        if (companyData) {
          console.log("Company data fetched:", companyData);
          setCompany(companyData);
          
          // Fetch available invoices for credit note - exclude cancelled invoices
          console.log("Fetching invoices for user:", userId);
          
          const { data: invoicesData, error: invoicesError } = await supabase
            .from('invoices')
            .select('id, invoice_number, financial_year, status, total_amount, invoice_date')
            .eq('user_id', userId)
            .neq('status', 'cancelled') // Exclude cancelled invoices
            .order('invoice_date', { ascending: false });
            
          if (invoicesError) {
            console.error("Error fetching invoices:", invoicesError);
            throw invoicesError;
          }
          
          console.log("Raw invoices data fetched:", invoicesData);
          console.log("Number of invoices found:", invoicesData?.length || 0);
          
          // Log each invoice for debugging
          if (invoicesData && invoicesData.length > 0) {
            invoicesData.forEach((inv, index) => {
              console.log(`Invoice ${index + 1}:`, {
                id: inv.id,
                number: inv.invoice_number,
                status: inv.status,
                financial_year: inv.financial_year,
                total_amount: inv.total_amount
              });
            });
          }
          
          // Convert to options format with less restrictive filtering
          let options: InvoiceOption[] = [];
          
          if (Array.isArray(invoicesData) && invoicesData.length > 0) {
            // Filter for valid invoices that can have credit notes
            const validInvoices = invoicesData.filter(inv => {
              const isValid = inv && 
                inv.id && 
                inv.invoice_number && 
                inv.financial_year &&
                typeof inv.id === 'string' &&
                typeof inv.invoice_number === 'string' &&
                // Allow more statuses - not just pending and paid, but exclude cancelled
                inv.status && 
                ['pending', 'paid', 'overdue', 'sent'].includes(inv.status.toLowerCase());
              
              if (!isValid) {
                console.log("Filtering out invalid invoice:", inv);
              } else {
                console.log("Valid invoice found:", inv.invoice_number, "Status:", inv.status);
              }
              return isValid;
            });
            
            console.log("Valid invoices after filtering:", validInvoices.length);
            
            options = validInvoices.map(inv => {
              const option = {
                value: inv.id,
                label: `${inv.invoice_number} (${inv.financial_year}) - ₹${Number(inv.total_amount || 0).toLocaleString()} - ${inv.status}`
              };
              console.log("Created invoice option:", option);
              return option;
            });
          }
            
          console.log("Final invoice options created:", options);
          setInvoiceOptions(options);
          
          // Log the options count for debugging
          if (options.length === 0) {
            console.warn("No valid invoice options created. Raw data:", invoicesData);
            
            // Show more specific message based on what we found
            if (!invoicesData || invoicesData.length === 0) {
              toast({
                title: "No Invoices Found",
                description: "No invoices found in your account. Please create and save some invoices first.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "No Eligible Invoices",
                description: `Found ${invoicesData.length} invoices, but none are eligible for credit notes. Only invoices with status 'pending', 'paid', 'overdue', or 'sent' can have credit notes.`,
                variant: "destructive",
              });
            }
          } else {
            console.log(`Successfully created ${options.length} invoice options`);
          }
        }
        
        // If editing existing credit note
        if (isEditing && id) {
          console.log("Editing existing credit note, id:", id);
          try {
            // Use * to fetch all fields from the credit_notes table
            const { data: creditNoteData, error: creditNoteError } = await supabase
              .from('credit_notes')
              .select('*, invoices(*)')
              .eq('id', id)
              .eq('user_id', userId)
              .maybeSingle();
              
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
              const transformedItems = Array.isArray(creditNoteItemsData) 
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
              
              // Set credit note state - include ALL fields from the database
              setCreditNote({
                invoiceId: creditNoteData.invoice_id || "",
                creditNoteNumber: creditNoteData.credit_note_number || "",
                creditNoteDate: new Date(creditNoteData.credit_note_date),
                financialYear: creditNoteData.financial_year || "",
                reason: creditNoteData.reason || "",
                items: transformedItems,
                status: creditNoteData.status || "draft",
                // Add these properties to match the extended CreditNoteData interface
                subtotal: creditNoteData.subtotal || 0,
                cgst: creditNoteData.cgst || 0,
                sgst: creditNoteData.sgst || 0,
                igst: creditNoteData.igst || 0,
                total_amount: creditNoteData.total_amount || 0,
              });
              
              // For debugging - log the original credit note and the transformed version
              console.log("Original credit note data:", creditNoteData);
              console.log("Transformed credit note data:", {
                invoiceId: creditNoteData.invoice_id || "",
                creditNoteNumber: creditNoteData.credit_note_number || "",
                creditNoteDate: new Date(creditNoteData.credit_note_date),
                financialYear: creditNoteData.financial_year || "",
                reason: creditNoteData.reason || "",
                items: transformedItems,
                status: creditNoteData.status || "draft",
                subtotal: creditNoteData.subtotal || 0,
                cgst: creditNoteData.cgst || 0,
                sgst: creditNoteData.sgst || 0,
                igst: creditNoteData.igst || 0,
                total_amount: creditNoteData.total_amount || 0,
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
            .eq('user_id', userId)
            .maybeSingle();
            
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
  }, [userId, id, isEditing]);
  
  // Fetch invoice items
  const fetchInvoiceItems = async (invoiceId: string) => {
    console.log("Calling fetchInvoiceItems for invoice ID:", invoiceId);
    try {
      if (!invoiceId) {
        console.log("No invoice ID provided to fetchInvoiceItems");
        return;
      }
      
      console.log("Fetching invoice items for invoice ID:", invoiceId);
      
      // Fetch invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);
        
      if (itemsError) throw itemsError;
      
      console.log("Invoice items data:", itemsData);
      
      // Get credited quantities for each item, excluding cancelled credit notes
      const itemIds = (itemsData || []).map(item => item.id);
      
      let creditedQuantities: {[key: string]: number} = {};
      
      if (itemIds.length > 0) {
        // Modified query to exclude credit note items from cancelled credit notes
        const { data: creditedData, error: creditedError } = await supabase
          .from('credit_note_items')
          .select(`
            invoice_item_id, 
            quantity,
            credit_notes!inner(status)
          `)
          .in('invoice_item_id', itemIds)
          .neq('credit_notes.status', 'cancelled'); // Exclude cancelled credit notes
          
        if (creditedError) throw creditedError;
        
        console.log("Credited quantities data (excluding cancelled):", creditedData);
        
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
      
      console.log("Items with available quantities (excluding cancelled credit notes):", itemsWithAvailable);
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

  return {
    loadingData,
    company,
    invoice,
    setInvoice, // Expose this function
    invoiceItems,
    invoiceOptions,
    creditNote,
    setCreditNote,
    fetchInvoiceItems,
  };
};
