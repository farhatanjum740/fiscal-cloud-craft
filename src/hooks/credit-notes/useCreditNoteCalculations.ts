
import { useState, useEffect } from "react";
import { CreditNoteData, CreditNoteGSTDetails } from "./types";

export const useCreditNoteCalculations = (
  creditNote: CreditNoteData,
  invoice: any,
  company: any
) => {
  const [subtotal, setSubtotal] = useState(0);
  const [gstDetails, setGstDetails] = useState<CreditNoteGSTDetails>({ 
    cgst: 0, 
    sgst: 0, 
    igst: 0 
  });
  const [total, setTotal] = useState(0);

  // Calculate totals whenever credit note items change
  useEffect(() => {
    console.log("Calculation triggered with data:", { creditNote, invoice, company });
    
    // If the credit note already has calculated values from database, use those
    if (creditNote && typeof creditNote.subtotal === 'number' && typeof creditNote.total_amount === 'number') {
      console.log("Using credit note's existing calculated values");
      setSubtotal(Number(creditNote.subtotal) || 0);
      
      setGstDetails({
        cgst: Number(creditNote.cgst) || 0,
        sgst: Number(creditNote.sgst) || 0,
        igst: Number(creditNote.igst) || 0
      });
      
      setTotal(Number(creditNote.total_amount) || 0);
      return;
    }
    
    // Otherwise calculate from items
    // Ensure creditNote and items exist
    if (!creditNote || !Array.isArray(creditNote.items) || creditNote.items.length === 0) {
      console.log("No items found in credit note for calculations");
      return;
    }
    
    const calcSubtotal = creditNote.items.reduce((acc, item) => {
      const itemPrice = Number(item.price) || 0;
      const itemQuantity = Number(item.quantity) || 0;
      return acc + (itemPrice * itemQuantity);
    }, 0);
    
    console.log("Calculated subtotal:", calcSubtotal);
    setSubtotal(calcSubtotal);
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    if (invoice && company) {
      // Customer and company state comparison
      const companyState = company.state;
      const customerState = invoice.customer_id ? 
        (invoice.customer_shipping_state || invoice.customer_billing_state) : null;
      
      // Determine whether to use IGST or CGST+SGST based on states
      const useIgst = companyState && customerState && companyState !== customerState;
      
      console.log("Tax calculation - Company state:", companyState);
      console.log("Tax calculation - Customer state:", customerState);
      console.log("Using IGST:", useIgst);
      
      creditNote.items.forEach(item => {
        const itemPrice = Number(item.price) || 0;
        const itemQuantity = Number(item.quantity) || 0;
        const gstRate = Number(item.gstRate) || 0;
        const gstAmount = (itemPrice * itemQuantity * gstRate) / 100;
        
        console.log(`Item ${item.productName} GST calculation:`, { 
          price: itemPrice, 
          quantity: itemQuantity, 
          rate: gstRate, 
          amount: gstAmount 
        });
        
        if (useIgst) {
          igst += gstAmount;
        } else {
          cgst += gstAmount / 2;
          sgst += gstAmount / 2;
        }
      });
    }
    
    console.log("Calculated GST:", { cgst, sgst, igst });
    setGstDetails({ cgst, sgst, igst });
    
    const calculatedTotal = calcSubtotal + cgst + sgst + igst;
    console.log("Calculated total:", calculatedTotal);
    setTotal(calculatedTotal);
    
  }, [creditNote, invoice, company]);

  return {
    subtotal,
    gstDetails,
    total
  };
};
