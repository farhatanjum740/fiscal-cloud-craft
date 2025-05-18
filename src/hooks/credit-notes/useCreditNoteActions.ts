import { useState } from "react";
import { supabase, getNextCreditNoteNumber } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CreditNoteData } from "./types";
import type { CreditNoteItem } from "@/types";

export const useCreditNoteActions = (
  creditNote: CreditNoteData,
  setCreditNote: (value: React.SetStateAction<CreditNoteData>) => void,
  invoice: any,
  invoiceItems: any[],
  company: any,
  userId: string | undefined,
  id?: string
) => {
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{[key: string]: boolean}>({});
  const [showQuantityError, setShowQuantityError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [hasAttemptedNumberGeneration, setHasAttemptedNumberGeneration] = useState(false);

  // Generate credit note number function using the database function
  const generateCreditNoteNumber = async (): Promise<string | null> => {
    console.log("Generating credit note number with company:", company);
    console.log("Financial year for credit note number generation:", creditNote.financialYear);
    
    if (!company) {
      console.error("No company data available for credit note number generation");
      toast({
        title: "Error",
        description: "Company profile is required to generate credit note number",
        variant: "destructive",
      });
      return null;
    }
    
    // Financial year is required
    if (!creditNote.financialYear) {
      console.error("No financial year available for credit note number generation");
      toast({
        title: "Error",
        description: "Financial year is required to generate credit note number",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setIsGeneratingNumber(true);
      
      console.log("Using financial year for number generation:", creditNote.financialYear);
      
      // Use the dedicated function from client.ts to get next credit note number
      const creditNoteNumber = await getNextCreditNoteNumber(
        company.id,
        creditNote.financialYear,
        'CN'
      );
      
      console.log("Generated credit note number:", creditNoteNumber, "for financial year:", creditNote.financialYear);
      
      // Update the credit note state with the generated number
      setCreditNote(prev => ({
        ...prev,
        creditNoteNumber
      }));
      
      // Show success message
      toast({
        title: "Success",
        description: "Credit note number generated successfully",
      });

      return creditNoteNumber;
    } catch (error: any) {
      console.error("Error generating credit note number:", error);
      toast({
        title: "Error",
        description: `Failed to generate credit note number: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGeneratingNumber(false);
      setHasAttemptedNumberGeneration(true);
    }
  };
  
  // Handle invoice selection with improved error handling
  const handleInvoiceChange = async (value: string) => {
    console.log("Invoice changed to:", value);
    
    try {
      if (!value) {
        console.log("Empty invoice value provided");
        return null;
      }
      
      // Fetch invoice data
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', value)
        .maybeSingle();
          
      if (error) {
        console.error("Error fetching invoice data:", error);
        throw error;
      }
      
      console.log("Selected invoice data:", data);
      
      if (data) {
        // Return the invoice data - we'll update the state in the parent hook
        return data;
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
    
    return null;
  };
  
  // Toggle item selection with improved error handling
  const toggleItemSelection = (itemId: string) => {
    try {
      if (!itemId) {
        console.log("Invalid item ID for selection toggle");
        return;
      }
      
      setSelectedItems(prev => ({
        ...prev,
        [itemId]: !prev[itemId]
      }));
    } catch (error) {
      console.error("Error toggling item selection:", error);
    }
  };
  
  // Add selected items to credit note with improved error handling
  const addSelectedItems = () => {
    try {
      if (!Array.isArray(invoiceItems)) {
        console.log("Invoice items is not an array");
        return;
      }
      
      const itemsToAdd = invoiceItems
        .filter(item => selectedItems[item.id])
        .map(item => ({
          id: `temp-${Date.now()}-${item.id}`,
          invoiceItemId: item.id,
          productId: item.product_id || "",
          productName: item.product_name || item.productName || "Unknown Product", 
          hsnCode: item.hsn_code || item.hsnCode || "", 
          quantity: item.availableQuantity || 0, 
          price: item.price || 0,
          unit: item.unit || "",
          gstRate: item.gst_rate || item.gstRate || 0,
          maxQuantity: item.availableQuantity || 0
        }));
        
      if (itemsToAdd.length === 0) {
        console.log("No items selected to add");
        return;
      }
      
      setCreditNote(prev => ({
        ...prev,
        items: [...(Array.isArray(prev.items) ? prev.items : []), ...itemsToAdd]
      }));
      
      // Clear selections
      setSelectedItems({});
    } catch (error) {
      console.error("Error adding selected items:", error);
      toast({
        title: "Error",
        description: "Failed to add selected items. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Remove an item from the credit note with improved error handling
  const removeItem = (id: string) => {
    try {
      if (!id) {
        console.log("Invalid item ID for removal");
        return;
      }
      
      setCreditNote(prev => {
        if (!Array.isArray(prev.items)) {
          return { ...prev, items: [] };
        }
        
        return {
          ...prev,
          items: prev.items.filter(item => item.id !== id)
        };
      });
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };
  
  // Update an item in the credit note with improved error handling
  const updateItem = (id: string, field: keyof CreditNoteItem, value: any) => {
    try {
      if (!id) {
        console.log("Invalid item ID for update");
        return;
      }
      
      setCreditNote(prev => {
        if (!Array.isArray(prev.items)) {
          return { ...prev, items: [] };
        }
        
        return {
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
        };
      });
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Save credit note with improved error handling and generating credit note number at save time
  const saveCreditNote = async (navigate: (path: string) => void) => {
    if (!userId) {
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
    
    if (!Array.isArray(creditNote.items) || creditNote.items.length === 0) {
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
      // Generate credit note number if not already set
      if (!creditNote.creditNoteNumber && creditNote.financialYear) {
        console.log("Generating credit note number for financial year:", creditNote.financialYear);
        const creditNoteNumber = await generateCreditNoteNumber();
        
        if (!creditNoteNumber) {
          throw new Error("Failed to generate credit note number");
        }
        
        // Store the generated number for use in the next steps
        creditNote.creditNoteNumber = creditNoteNumber;
      }
      
      // Format date for SQL
      const creditNoteDateFormatted = format(creditNote.creditNoteDate, 'yyyy-MM-dd');
      
      // Prepare credit note data
      const creditNoteData = {
        user_id: userId,
        company_id: company.id,
        invoice_id: creditNote.invoiceId,
        credit_note_number: creditNote.creditNoteNumber,
        credit_note_date: creditNoteDateFormatted,
        financial_year: creditNote.financialYear,
        reason: creditNote.reason || "",
        subtotal: 0, // Will be calculated based on items
        cgst: 0,     // Will be calculated based on items
        sgst: 0,     // Will be calculated based on items
        igst: 0,     // Will be calculated based on items
        total_amount: 0, // Will be calculated based on items
        status: creditNote.status,
      };
      
      // Calculate totals with safety checks
      const safeItems = Array.isArray(creditNote.items) ? creditNote.items : [];
      const subtotal = safeItems.reduce((acc, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return acc + (price * quantity);
      }, 0);
      
      let cgst = 0;
      let sgst = 0;
      let igst = 0;
      
      // Determine whether to use CGST+SGST or IGST based on invoice
      const useIgst = invoice && invoice.igst > 0;
      
      safeItems.forEach(item => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        const gstRate = Number(item.gstRate) || 0;
        const gstAmount = (price * quantity * gstRate) / 100;
        
        if (useIgst) {
          igst += gstAmount;
        } else {
          cgst += gstAmount / 2;
          sgst += gstAmount / 2;
        }
      });
      
      // Update the totals
      creditNoteData.subtotal = subtotal;
      creditNoteData.cgst = cgst;
      creditNoteData.sgst = sgst;
      creditNoteData.igst = igst;
      creditNoteData.total_amount = subtotal + cgst + sgst + igst;
      
      let creditNoteId: string;
      const isEditing = !!id;
      
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
      const creditNoteItemsData = safeItems.map(item => ({
        credit_note_id: creditNoteId,
        invoice_item_id: item.invoiceItemId || null,
        product_id: item.productId || null,
        product_name: item.productName || "Unknown",
        hsn_code: item.hsnCode || "",
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
        unit: item.unit || "",
        gst_rate: Number(item.gstRate) || 0,
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
    loading,
    selectedItems,
    showQuantityError,
    setShowQuantityError,
    errorMessage,
    isGeneratingNumber,
    toggleItemSelection,
    addSelectedItems,
    removeItem,
    updateItem,
    generateCreditNoteNumber,
    handleInvoiceChange,
    saveCreditNote
  };
};
