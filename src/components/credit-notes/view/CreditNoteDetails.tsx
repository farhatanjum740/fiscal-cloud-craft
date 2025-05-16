
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

  console.log("Credit Note Details Props:", { creditNote, invoice, customer });

  return (
    <div className="mb-6 bg-gray-50 p-4 border border-gray-200 rounded">
      <h3 className="font-semibold text-gray-800 mb-2">Credit Note Details:</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p><span className="font-medium">Credit Note Number:</span> {creditNote?.credit_note_number || 'N/A'}</p>
          <p><span className="font-medium">Credit Note Date:</span> {formatDateSafely(creditNote?.credit_note_date)}</p>
          <p><span className="font-medium">Status:</span> {creditNote?.status ? creditNote.status.charAt(0).toUpperCase() + creditNote.status.slice(1) : 'N/A'}</p>
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
