
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
      credit_note_number: creditNote?.creditNoteNumber,
      credit_note_date: creditNote?.creditNoteDate,
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
  const creditNoteNumber = creditNote?.creditNoteNumber || 'N/A';
  const creditNoteDate = creditNote?.creditNoteDate instanceof Date ? 
                         creditNote.creditNoteDate.toISOString() : creditNote?.creditNoteDate;
  const creditNoteStatus = creditNote?.status || 'Draft';

  return (
    <div className="mb-5 bg-gray-50 p-3 border border-gray-200 rounded">
      <h3 className="font-semibold text-sm text-gray-800 mb-2">Credit Note Details:</h3>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p><span className="font-medium">Credit Note Number:</span> {creditNoteNumber}</p>
          <p><span className="font-medium">Credit Note Date:</span> {formatDateSafely(creditNoteDate)}</p>
          <p><span className="font-medium">Status:</span> {creditNoteStatus.charAt(0).toUpperCase() + creditNoteStatus.slice(1)}</p>
        </div>
        <div>
          <p><span className="font-medium">Reference Invoice:</span> {invoice?.invoice_number || 'N/A'}</p>
          <p><span className="font-medium">Invoice Date:</span> {invoice?.invoice_date ? formatDateSafely(invoice.invoice_date) : 'N/A'}</p>
          <p><span className="font-medium">Customer:</span> {customer?.name || 'N/A'}</p>
          {customer?.phone && <p><span className="font-medium">Phone:</span> {customer.phone}</p>}
          {customer?.email && <p><span className="font-medium">Email:</span> {customer.email}</p>}
        </div>
      </div>
    </div>
  );
};

export default CreditNoteDetails;
