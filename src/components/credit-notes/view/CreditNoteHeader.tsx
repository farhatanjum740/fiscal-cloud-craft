
import React from 'react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface CreditNoteHeaderProps {
  creditNote: any;
  invoice: any;
  company: any;
}

const CreditNoteHeader: React.FC<CreditNoteHeaderProps> = ({ creditNote, invoice, company }) => {
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

  // Get credit note number and date, handling both formats
  const creditNoteNumber = creditNote?.creditNoteNumber || 'Draft';
  const creditNoteDate = creditNote?.creditNoteDate instanceof Date ? 
                         creditNote.creditNoteDate.toISOString() : creditNote?.creditNoteDate;

  console.log("CreditNoteHeader - Display Data:", {
    number: creditNoteNumber,
    date: creditNoteDate,
    formattedDate: creditNoteDate ? formatDateSafely(creditNoteDate) : 'N/A'
  });

  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-gray-800">CREDIT NOTE</h1>
          <p className="text-sm text-gray-500"># {creditNoteNumber}</p>
          <p className="text-sm text-gray-500 mt-1">Date: {formatDateSafely(creditNoteDate)}</p>
          {invoice && (
            <p className="text-sm text-gray-500">Reference Invoice: {invoice.invoice_number || 'N/A'}</p>
          )}
        </div>
        
        <div className="text-right">
          {company.logo && (
            <div className="flex items-start gap-3 justify-end">
              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="h-10 w-auto object-contain" 
              />
              <div>
                <h2 className="text-lg font-bold text-gray-800">{company.name}</h2>
                <p className="text-xs text-gray-600">{company.address_line1 || 'N/A'}</p>
                {company.address_line2 && <p className="text-xs text-gray-600">{company.address_line2}</p>}
                <p className="text-xs text-gray-600">{company.city || 'N/A'}, {company.state || 'N/A'} - {company.pincode || 'N/A'}</p>
                <p className="text-xs text-gray-600">GSTIN: {company.gstin || 'N/A'}</p>
                {company.email && <p className="text-xs text-gray-600">Email: {company.email}</p>}
                {company.phone && <p className="text-xs text-gray-600">Phone: {company.phone}</p>}
              </div>
            </div>
          )}
          {!company.logo && (
            <div>
              <h2 className="text-lg font-bold text-gray-800">{company.name}</h2>
              <p className="text-xs text-gray-600">{company.address_line1 || 'N/A'}</p>
              {company.address_line2 && <p className="text-xs text-gray-600">{company.address_line2}</p>}
              <p className="text-xs text-gray-600">{company.city || 'N/A'}, {company.state || 'N/A'} - {company.pincode || 'N/A'}</p>
              <p className="text-xs text-gray-600">GSTIN: {company.gstin || 'N/A'}</p>
              {company.email && <p className="text-xs text-gray-600">Email: {company.email}</p>}
              {company.phone && <p className="text-xs text-gray-600">Phone: {company.phone}</p>}
            </div>
          )}
        </div>
      </div>
      
      <Separator className="my-4" />
    </>
  );
};

export default CreditNoteHeader;
