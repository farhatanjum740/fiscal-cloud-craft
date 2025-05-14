
import React, { useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import CreditNoteHeader from './CreditNoteHeader';
import CreditNoteCustomerInfo from './CreditNoteCustomerInfo';
import CreditNoteDetails from './CreditNoteDetails';
import CreditNoteItemsTable from './CreditNoteItemsTable';
import CreditNoteSummary from './CreditNoteSummary';
import CreditNoteFooter from './CreditNoteFooter';

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
        filename: `Credit-Note-${creditNote.credit_note_number}.pdf`,
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
        </div>
      )}
      
      <div 
        ref={printRef} 
        className="bg-white p-8 max-w-4xl mx-auto shadow-sm border rounded-md print:shadow-none print:border-none"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        <CreditNoteHeader creditNote={creditNote} invoice={invoice} company={company} />
        
        <CreditNoteCustomerInfo customer={customer} />
        
        <CreditNoteDetails creditNote={creditNote} invoice={invoice} customer={customer} />
        
        <CreditNoteItemsTable items={creditNote.items} />
        
        <CreditNoteSummary 
          subtotal={creditNote.subtotal} 
          cgst={creditNote.cgst} 
          sgst={creditNote.sgst} 
          igst={creditNote.igst} 
          totalAmount={creditNote.total_amount} 
        />
        
        {creditNote.reason && (
          <div className="mb-6">
            <h4 className="font-semibold mb-1">Reason:</h4>
            <p className="whitespace-pre-line">{creditNote.reason}</p>
          </div>
        )}
        
        <CreditNoteFooter company={company} />
      </div>
    </div>
  );
};

export default CreditNoteView;
