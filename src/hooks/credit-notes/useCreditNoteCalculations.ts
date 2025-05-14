
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
    // Ensure creditNote and items exist
    if (!creditNote || !Array.isArray(creditNote.items)) {
      return;
    }
    
    const calcSubtotal = creditNote.items.reduce((acc, item) => {
      const itemPrice = Number(item.price) || 0;
      const itemQuantity = Number(item.quantity) || 0;
      return acc + (itemPrice * itemQuantity);
    }, 0);
    
    setSubtotal(calcSubtotal);
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    if (invoice && company) {
      // Determine whether to use CGST+SGST or IGST based on invoice
      const useIgst = invoice.igst > 0;
      
      creditNote.items.forEach(item => {
        const itemPrice = Number(item.price) || 0;
        const itemQuantity = Number(item.quantity) || 0;
        const gstRate = Number(item.gstRate) || 0;
        const gstAmount = (itemPrice * itemQuantity * gstRate) / 100;
        
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
    
  }, [creditNote?.items, invoice, company]);

  return {
    subtotal,
    gstDetails,
    total
  };
};
