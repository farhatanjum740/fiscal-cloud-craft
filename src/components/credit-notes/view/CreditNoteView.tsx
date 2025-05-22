
import React, { useRef, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Printer, Download, Mail } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import CreditNoteHeader from './CreditNoteHeader';
import CreditNoteCustomerInfo from './CreditNoteCustomerInfo';
import CreditNoteDetails from './CreditNoteDetails';
import CreditNoteItemsTable from './CreditNoteItemsTable';
import CreditNoteSummary from './CreditNoteSummary';
import CreditNoteFooter from './CreditNoteFooter';
import EmailCreditNoteDialog from '@/components/dialogs/EmailCreditNoteDialog';

interface CreditNoteViewProps {
  creditNote: any;
  company: any;
  invoice: any;
  customer: any;
  isDownloadable?: boolean;
}

const CreditNoteView: React.FC<CreditNoteViewProps> = ({ 
  creditNote, 
  company, 
  invoice, 
  customer,
  isDownloadable = true 
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  
  // Log data to console for debugging
  useEffect(() => {
    console.log("Credit Note View - Data received:", {
      creditNote,
      company,
      invoice,
      customer
    });
    
    if (creditNote) {
      // Log specific credit note properties
      console.log("Credit Note View - Credit Note Details:", {
        number: creditNote.creditNoteNumber || creditNote.credit_note_number,
        date: creditNote.creditNoteDate || creditNote.credit_note_date,
        subtotal: creditNote.subtotal,
        cgst: creditNote.cgst,
        sgst: creditNote.sgst,
        igst: creditNote.igst,
        totalAmount: creditNote.total_amount,
        id: creditNote.id
      });
    }
  }, [creditNote, company, invoice, customer]);
  
  if (!creditNote || !company) {
    return (
      <div className="p-6 text-center">
        <p>Loading credit note details...</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = async () => {
    if (!printRef.current) return;
    
    try {
      toast({ title: "Generating PDF", description: "Please wait while we prepare your credit note..." });
      
      // Improved PDF configuration for better rendering
      const options = {
        filename: `Credit-Note-${creditNote.creditNoteNumber || creditNote.credit_note_number || 'draft'}.pdf`,
        margin: [5, 5, 5, 5], // 5mm margins as requested
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          logging: false,
          removeContainer: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: false, // Disable compression for better text rendering
          precision: 16,
          putOnlyUsedFonts: true,
          floatPrecision: "smart"
        },
        enableLinks: true,
        pagebreak: { mode: 'avoid-all' }
      };
      
      await html2pdf().set(options).from(printRef.current).save();
      
      toast({ title: "Download complete", description: "Credit note has been downloaded as PDF." });
    } catch (error) {
      console.error('Error generating credit note PDF:', error);
      toast({ 
        title: "Download failed", 
        description: "Failed to generate PDF. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleEmail = () => {
    // Ensure we have the credit note ID
    if (!creditNote) {
      toast({
        title: "Missing Credit Note",
        description: "Credit note data is not available. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Get ID directly from the credit note object, checking all possible locations
    const id = creditNote.id || null;
    
    console.log("Original credit note object:", creditNote);
    console.log("Credit note ID from original object:", id);
    
    if (!id) {
      toast({
        title: "Missing Credit Note ID",
        description: "Could not find credit note ID. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a normalized credit note object with consistent property names
    // Deep clone to avoid reference issues
    const normalizedCreditNote = JSON.parse(JSON.stringify({
      ...creditNote,
      id: id, // Explicitly set ID
      creditNoteNumber: creditNote.creditNoteNumber || creditNote.credit_note_number,
      creditNoteDate: creditNote.creditNoteDate || creditNote.credit_note_date,
      invoiceId: creditNote.invoiceId || creditNote.invoice_id,
      invoice: invoice, // Include the related invoice
      invoices: invoice, // For compatibility
    }));
    
    // Log credit note data for debugging before opening dialog
    console.log("Opening email dialog with credit note:", normalizedCreditNote);
    console.log("Credit note ID (explicit):", normalizedCreditNote.id);
    
    setEmailDialogOpen(true);
  };

  // Ensure items is an array and log for debugging
  let safeItems = [];
  if (creditNote.items) {
    safeItems = Array.isArray(creditNote.items) ? creditNote.items : [];
    console.log("Using credit note items:", safeItems);
  } else if (Array.isArray(creditNote.credit_note_items)) {
    safeItems = creditNote.credit_note_items;
    console.log("Using credit_note_items:", safeItems);
  }
  
  // Determine if we should show IGST or CGST/SGST based on states
  const useIGST = company && customer && 
    company.state && (customer.shipping_state || customer.billing_state) && 
    company.state !== (customer.shipping_state || customer.billing_state);
  
  console.log("States comparison:", {
    companyState: company?.state,
    customerState: customer?.shipping_state || customer?.billing_state,
    useIGST
  });
  
  // Ensure numerical values are numbers
  const safeSubtotal = parseFloat(String(creditNote.subtotal)) || 0;
  const safeCgst = parseFloat(String(creditNote.cgst)) || 0;
  const safeSgst = parseFloat(String(creditNote.sgst)) || 0;
  const safeIgst = parseFloat(String(creditNote.igst)) || 0;
  const safeTotalAmount = parseFloat(String(creditNote.total_amount)) || 0;

  // Create normalized version of credit note for consistency
  const normalizedCreditNote = {
    ...creditNote,
    creditNoteNumber: creditNote.creditNoteNumber || creditNote.credit_note_number,
    creditNoteDate: creditNote.creditNoteDate || creditNote.credit_note_date,
    reason: creditNote.reason || "",
    // Ensure ID is explicitly included
    id: creditNote.id,
    invoiceId: creditNote.invoiceId || creditNote.invoice_id
  };

  return (
    <div className="bg-white">
      {isDownloadable && (
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload} title="Download Credit Note">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={handleEmail} title="Email Credit Note">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      )}
      
      <div 
        ref={printRef} 
        className="bg-white p-4 max-w-4xl mx-auto shadow-sm border rounded-md print:shadow-none print:border-none text-sm"
        style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}
      >
        <CreditNoteHeader creditNote={normalizedCreditNote} invoice={invoice} company={company} />
        
        <CreditNoteCustomerInfo customer={customer} />
        
        <CreditNoteDetails creditNote={normalizedCreditNote} invoice={invoice} customer={customer} />
        
        <CreditNoteItemsTable items={safeItems} useIGST={useIGST} />
        
        <CreditNoteSummary 
          subtotal={safeSubtotal} 
          cgst={safeCgst} 
          sgst={safeSgst} 
          igst={safeIgst} 
          totalAmount={safeTotalAmount}
          useIGST={useIGST}
        />
        
        {normalizedCreditNote.reason && (
          <div className="mb-3 text-xs">
            <h4 className="font-semibold mb-1">Reason:</h4>
            <p className="whitespace-pre-line">{normalizedCreditNote.reason}</p>
          </div>
        )}
        
        <CreditNoteFooter company={company} />
      </div>

      <EmailCreditNoteDialog 
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        creditNote={normalizedCreditNote}
        company={company}
      />
    </div>
  );
};

export default CreditNoteView;
