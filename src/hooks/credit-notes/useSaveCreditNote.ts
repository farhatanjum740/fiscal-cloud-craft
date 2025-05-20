
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CreditNoteData } from "./types";
import { getNextCreditNoteNumber } from "@/integrations/supabase/client";

export const useSaveCreditNote = (
  creditNote: CreditNoteData,
  company: any,
  invoice: any,
  userId: string | undefined,
  id?: string
) => {
  const [loading, setLoading] = useState(false);

  // Save credit note with improved error handling and getting a real credit note number at save time
  const saveCreditNote = async (navigate: (path: string) => void, previewedCreditNoteNumber: string | null) => {
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
      // Now we need to get a real credit note number that increments the counter
      // We'll use the previewed number if it exists, or generate a new one
      let finalCreditNoteNumber: string;
      
      if (previewedCreditNoteNumber) {
        console.log("Using previewed credit note number:", previewedCreditNoteNumber);
        
        // Get an actual incremented number from the database
        const creditNoteNumber = await getNextCreditNoteNumber(
          company.id,
          creditNote.financialYear,
          'CN',
          false // not in preview mode - increment the counter
        );
        
        finalCreditNoteNumber = creditNoteNumber;
      } else if (creditNote.creditNoteNumber) {
        // If we already have a number (for editing), use it
        finalCreditNoteNumber = creditNote.creditNoteNumber;
      } else {
        // If no number has been generated yet, generate one now
        const creditNoteNumber = await getNextCreditNoteNumber(
          company.id,
          creditNote.financialYear,
          'CN',
          false // not in preview mode - increment the counter
        );
        
        finalCreditNoteNumber = creditNoteNumber;
      }
      
      // Format date for SQL
      const creditNoteDateFormatted = format(creditNote.creditNoteDate, 'yyyy-MM-dd');
      
      // Prepare credit note data
      const creditNoteData = {
        user_id: userId,
        company_id: company.id,
        invoice_id: creditNote.invoiceId,
        credit_note_number: finalCreditNoteNumber,
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
    saveCreditNote
  };
};
