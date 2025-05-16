
import React from 'react';
import { format } from 'date-fns';

interface CreditNoteDetailsProps {
  creditNote: any;
  invoice: any;
  customer: any;
}

const CreditNoteDetails: React.FC<CreditNoteDetailsProps> = ({ creditNote, invoice, customer }) => {
  // Format date safely
  const formatDateSafely = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'N/A';
    }
  };

  console.log("Credit Note Details Props:", { 
    creditNote: {
      credit_note_number: creditNote?.credit_note_number,
      credit_note_date: creditNote?.credit_note_date,
      status: creditNote?.status
    }, 
    invoice: {
      invoice_number: invoice?.invoice_number,
      invoice_date: invoice?.invoice_date
    },
    customer: {
      name: customer?.name
    }
  });

  // Get credit note number and date, handling both formats
  const creditNoteNumber = creditNote?.credit_note_number || creditNote?.creditNoteNumber || 'N/A';
  const creditNoteDate = creditNote?.credit_note_date || 
                         (creditNote?.creditNoteDate instanceof Date ? 
                          creditNote.creditNoteDate.toISOString() : null);
  const creditNoteStatus = creditNote?.status || 'Draft';

  return (
    <div className="mb-6 bg-gray-50 p-4 border border-gray-200 rounded">
      <h3 className="font-semibold text-gray-800 mb-2">Credit Note Details:</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p><span className="font-medium">Credit Note Number:</span> {creditNoteNumber}</p>
          <p><span className="font-medium">Credit Note Date:</span> {formatDateSafely(creditNoteDate)}</p>
          <p><span className="font-medium">Status:</span> {creditNoteStatus.charAt(0).toUpperCase() + creditNoteStatus.slice(1)}</p>
        </div>
        <div>
          <p><span className="font-medium">Reference Invoice:</span> {invoice?.invoice_number || 'N/A'}</p>
          <p><span className="font-medium">Invoice Date:</span> {invoice?.invoice_date ? formatDateSafely(invoice.invoice_date) : 'N/A'}</p>
          <p><span className="font-medium">Customer:</span> {customer?.name || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default CreditNoteDetails;
