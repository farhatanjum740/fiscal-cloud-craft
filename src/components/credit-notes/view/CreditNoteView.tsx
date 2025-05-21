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
        number: creditNote.creditNoteNumber,
        date: creditNote.creditNoteDate,
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
      
      const options = {
        filename: `Credit-Note-${creditNote.creditNoteNumber || 'draft'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
  
  console.log("Credit note values after conversion:", {
    original: {
      subtotal: creditNote.subtotal,
      cgst: creditNote.cgst,
      sgst: creditNote.sgst,
      igst: creditNote.igst,
      totalAmount: creditNote.total_amount
    },
    converted: {
      safeSubtotal,
      safeCgst,
      safeSgst, 
      safeIgst,
      safeTotalAmount
    }
  });

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
        className="bg-white p-6 max-w-4xl mx-auto shadow-sm border rounded-md print:shadow-none print:border-none text-sm"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        <CreditNoteHeader creditNote={creditNote} invoice={invoice} company={company} />
        
        <CreditNoteCustomerInfo customer={customer} />
        
        <CreditNoteDetails creditNote={creditNote} invoice={invoice} customer={customer} />
        
        <CreditNoteItemsTable items={safeItems} useIGST={useIGST} />
        
        <CreditNoteSummary 
          subtotal={safeSubtotal} 
          cgst={safeCgst} 
          sgst={safeSgst} 
          igst={safeIgst} 
          totalAmount={safeTotalAmount}
          useIGST={useIGST}
        />
        
        {creditNote.reason && (
          <div className="mb-4 text-xs">
            <h4 className="font-semibold mb-1">Reason:</h4>
            <p className="whitespace-pre-line">{creditNote.reason}</p>
          </div>
        )}
        
        <CreditNoteFooter company={company} />
      </div>

      <EmailCreditNoteDialog 
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        creditNote={creditNote}
        company={company}
      />
    </div>
  );
};

export default CreditNoteView;
