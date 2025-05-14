
import React from 'react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface CreditNoteHeaderProps {
  creditNote: any;
  invoice: any;
  company: any;
}

const CreditNoteHeader: React.FC<CreditNoteHeaderProps> = ({ creditNote, invoice, company }) => {
  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">CREDIT NOTE</h1>
          <p className="text-gray-500"># {creditNote.credit_note_number}</p>
          <p className="text-gray-500 mt-2">Date: {creditNote.credit_note_date ? format(new Date(creditNote.credit_note_date), 'dd/MM/yyyy') : 'N/A'}</p>
          {invoice && (
            <p className="text-gray-500">Reference Invoice: {invoice.invoice_number}</p>
          )}
        </div>
        
        <div className="text-right">
          {company.logo && (
            <div className="flex items-start gap-3 justify-end">
              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="h-12 w-auto object-contain" 
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800">{company.name}</h2>
                <p className="text-sm text-gray-600">{company.address_line1}</p>
                {company.address_line2 && <p className="text-sm text-gray-600">{company.address_line2}</p>}
                <p className="text-sm text-gray-600">{company.city}, {company.state} - {company.pincode}</p>
                <p className="text-sm text-gray-600">GSTIN: {company.gstin}</p>
                {company.email && <p className="text-sm text-gray-600">Email: {company.email}</p>}
                {company.phone && <p className="text-sm text-gray-600">Phone: {company.phone}</p>}
              </div>
            </div>
          )}
          {!company.logo && (
            <div>
              <h2 className="text-xl font-bold text-gray-800">{company.name}</h2>
              <p className="text-sm text-gray-600">{company.address_line1}</p>
              {company.address_line2 && <p className="text-sm text-gray-600">{company.address_line2}</p>}
              <p className="text-sm text-gray-600">{company.city}, {company.state} - {company.pincode}</p>
              <p className="text-sm text-gray-600">GSTIN: {company.gstin}</p>
              {company.email && <p className="text-sm text-gray-600">Email: {company.email}</p>}
              {company.phone && <p className="text-sm text-gray-600">Phone: {company.phone}</p>}
            </div>
          )}
        </div>
      </div>
      
      <Separator className="my-6" />
    </>
  );
};

export default CreditNoteHeader;
