
import React from 'react';

interface CreditNoteFooterProps {
  company: any;
}

const CreditNoteFooter: React.FC<CreditNoteFooterProps> = ({ company }) => {
  return (
    <>
      <div className="border-t pt-4 mt-4">
        <h4 className="font-semibold mb-1">Bank Details:</h4>
        <p className="text-sm">
          {company.bank_account_name} ({company.bank_account_number}) | {company.bank_name}, {company.bank_branch} | IFSC: {company.bank_ifsc_code}
        </p>
      </div>
      
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>This is a computer generated credit note.</p>
        <p>Credit note created from www.invoiceninja.in</p>
      </div>
    </>
  );
};

export default CreditNoteFooter;
