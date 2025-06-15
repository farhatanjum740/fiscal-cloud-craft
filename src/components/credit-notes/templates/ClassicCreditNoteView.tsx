
import React from "react";

interface ClassicCreditNoteViewProps {
  creditNote: any;
  company: any;
  invoice: any;
  customer: any;
  isDownloadable?: boolean;
}

const ClassicCreditNoteView: React.FC<ClassicCreditNoteViewProps> = ({
  creditNote,
  company,
  invoice,
  customer,
  isDownloadable = true
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white" style={{ fontFamily: 'Courier New, monospace' }}>
      {/* Classic Header with Border Box */}
      <div className="border-4 border-black p-6 mb-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ letterSpacing: '2px' }}>
            CREDIT NOTE
          </h1>
          <div className="border-2 border-black p-2 inline-block">
            <span className="text-lg font-bold">
              No: {creditNote.creditNoteNumber || 'DRAFT'}
            </span>
          </div>
        </div>
      </div>

      {/* Company and Customer Info in Classic Layout */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        {/* From Section */}
        <div className="border-2 border-black p-4">
          <h3 className="font-bold text-lg mb-3 underline">FROM:</h3>
          <div className="space-y-1">
            <div className="font-bold text-lg">{company?.name || 'Company Name'}</div>
            {company?.address && <div>{company.address}</div>}
            {company?.city && <div>{company.city}, {company?.state} {company?.pincode}</div>}
            {company?.gstin && <div>GSTIN: {company.gstin}</div>}
            {company?.phone && <div>Phone: {company.phone}</div>}
            {company?.email && <div>Email: {company.email}</div>}
          </div>
        </div>

        {/* To Section */}
        <div className="border-2 border-black p-4">
          <h3 className="font-bold text-lg mb-3 underline">TO:</h3>
          <div className="space-y-1">
            <div className="font-bold text-lg">{customer?.name || 'Customer Name'}</div>
            {customer?.address && <div>{customer.address}</div>}
            {customer?.city && <div>{customer.city}, {customer?.state} {customer?.pincode}</div>}
            {customer?.gstin && <div>GSTIN: {customer.gstin}</div>}
            {customer?.phone && <div>Phone: {customer.phone}</div>}
            {customer?.email && <div>Email: {customer.email}</div>}
          </div>
        </div>
      </div>

      {/* Credit Note Details */}
      <div className="border-2 border-black p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Credit Note Date:</strong> {formatDate(creditNote.creditNoteDate)}
          </div>
          <div>
            <strong>Reference Invoice:</strong> {invoice?.invoice_number || 'N/A'}
          </div>
          <div>
            <strong>Invoice Date:</strong> {formatDate(invoice?.invoice_date)}
          </div>
          <div>
            <strong>Reason:</strong> {creditNote.reason || 'N/A'}
          </div>
        </div>
      </div>

      {/* Items Table with Classic Border Design */}
      <div className="border-4 border-black mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="border-r-2 border-black p-3 text-left font-bold">DESCRIPTION</th>
              <th className="border-r-2 border-black p-3 text-center font-bold">QTY</th>
              <th className="border-r-2 border-black p-3 text-right font-bold">RATE</th>
              <th className="border-r-2 border-black p-3 text-right font-bold">TAX</th>
              <th className="p-3 text-right font-bold">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {creditNote.items?.map((item: any, index: number) => (
              <tr key={index} className="border-b border-black">
                <td className="border-r-2 border-black p-3">
                  <div className="font-bold">{item.description}</div>
                  {item.hsn_code && <div className="text-sm">HSN: {item.hsn_code}</div>}
                </td>
                <td className="border-r-2 border-black p-3 text-center">{item.quantity}</td>
                <td className="border-r-2 border-black p-3 text-right">{formatCurrency(item.rate)}</td>
                <td className="border-r-2 border-black p-3 text-right">{item.tax_percentage}%</td>
                <td className="p-3 text-right font-bold">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-6">
        <div className="border-4 border-black p-4 w-80">
          <div className="space-y-2">
            <div className="flex justify-between border-b border-black pb-1">
              <span>Subtotal:</span>
              <span>{formatCurrency(creditNote.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between border-b border-black pb-1">
              <span>Tax Amount:</span>
              <span>{formatCurrency(creditNote.tax_amount || 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-2 border-black p-2">
              <span>TOTAL:</span>
              <span>{formatCurrency(creditNote.total_amount || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Classic Footer */}
      <div className="border-2 border-black p-4 text-center">
        <div className="mb-4">
          <strong>*** CREDIT NOTE ***</strong>
        </div>
        <div className="text-sm">
          This is a computer generated credit note and does not require physical signature.
        </div>
        {creditNote.notes && (
          <div className="mt-4 border-t border-black pt-2">
            <strong>Notes:</strong> {creditNote.notes}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassicCreditNoteView;
