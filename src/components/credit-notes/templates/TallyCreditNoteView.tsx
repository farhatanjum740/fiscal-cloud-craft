
import React from "react";

interface TallyCreditNoteViewProps {
  creditNote: any;
  company: any;
  invoice: any;
  customer: any;
  isDownloadable?: boolean;
}

const TallyCreditNoteView: React.FC<TallyCreditNoteViewProps> = ({
  creditNote,
  company,
  invoice,
  customer,
  isDownloadable = true
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date as any)) return "";
      return date.toLocaleDateString("en-IN");
    } catch {
      return "";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
  };

  return (
    <div className="bg-white p-6 max-w-4xl mx-auto shadow-sm border-2 border-black rounded-none text-xs">
      {/* Header: Tally style */}
      <div className="border-2 border-black p-4 mb-4">
        <div className="text-center border-b-2 border-black pb-3 mb-3">
          <div className="flex items-center justify-center gap-4">
            {company?.logo && (
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="h-12 w-auto object-contain"
              />
            )}
            <div>
              <h2 className="text-xl font-bold text-black uppercase tracking-wide">{company?.name}</h2>
              <p className="text-sm font-medium text-gray-700">{company?.address}</p>
              {company?.city && <p className="text-sm font-medium text-gray-700">{company.city}, {company?.state} - {company?.pincode}</p>}
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-300">
            <div className="text-left">
              <p className="text-xs font-semibold">GSTIN: {company?.gstin}</p>
              {company?.phone && (
                <p className="text-xs">{company.phone}</p>
              )}
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-black border-2 border-black px-4 py-1">CREDIT NOTE</h1>
            </div>
            <div className="text-right">
              {company?.email && (
                <p className="text-xs">{company.email}</p>
              )}
            </div>
          </div>
        </div>
        {/* Credit Note details */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="border border-black p-2">
            <p className="font-bold">Credit Note #: {creditNote.creditNoteNumber || 'DRAFT'}</p>
            <p className="font-bold">Date: {creditNote.creditNoteDate ? formatDate(creditNote.creditNoteDate) : ''}</p>
            <p className="font-bold">Ref. Invoice: {invoice?.invoice_number || "N/A"}</p>
            <p className="font-bold">Invoice Date: {formatDate(invoice?.invoice_date)}</p>
            {creditNote.reason && <p className="font-bold">Reason: {creditNote.reason}</p>}
          </div>
          <div className="border border-black p-2 text-right">
            <p className="font-bold">Original for Recipient</p>
          </div>
        </div>
      </div>
      {/* Customer Information in Tally style */}
      <div className="border-2 border-black mb-4">
        <div className="bg-gray-100 p-2 border-b border-black">
          <h3 className="font-bold text-sm text-black">BILL TO PARTY</h3>
        </div>
        <div className="p-3">
          <p className="font-bold text-sm">{customer?.name}</p>
          <p className="text-xs">{customer?.address}</p>
          {customer?.city && <p className="text-xs">{customer.city}, {customer?.state} - {customer?.pincode}</p>}
          {customer?.gstin && <p className="text-xs font-semibold">GSTIN: {customer.gstin}</p>}
          {customer?.email && <p className="text-xs">Email: {customer.email}</p>}
          {customer?.phone && <p className="text-xs">Phone: {customer.phone}</p>}
        </div>
      </div>
      {/* Items table */}
      <div className="border-2 border-black mb-4">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-2 border-r border-black font-bold">Sl</th>
              <th className="py-2 px-2 border-r border-black font-bold">Particulars</th>
              <th className="py-2 px-2 border-r border-black font-bold">HSN</th>
              <th className="py-2 px-2 border-r border-black font-bold">Qty</th>
              <th className="py-2 px-2 border-r border-black font-bold">Rate</th>
              <th className="py-2 px-2 border-r border-black font-bold">Tax%</th>
              <th className="py-2 px-2 border-r border-black font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(creditNote.items) && creditNote.items.map((item: any, index: number) => (
              <tr key={item.id || index} className="border-b border-gray-300">
                <td className="py-1 px-2 border-r border-gray-300 text-center">{index + 1}</td>
                <td className="py-1 px-2 border-r border-gray-300">
                  <div className="font-medium">{item.description}</div>
                </td>
                <td className="py-1 px-2 border-r border-gray-300 text-center">{item.hsn_code}</td>
                <td className="py-1 px-2 border-r border-gray-300 text-center">{item.quantity}</td>
                <td className="py-1 px-2 border-r border-gray-300 text-right">{formatCurrency(item.rate)}</td>
                <td className="py-1 px-2 border-r border-black text-right">{item.tax_percentage}%</td>
                <td className="py-1 px-2 text-right font-semibold">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Summary */}
      <div className="border-2 border-black mb-4">
        <div className="w-64 p-3 ml-auto">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span className="font-semibold">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(creditNote.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span className="font-semibold">Tax Amount:</span>
              <span className="font-semibold">{formatCurrency(creditNote.tax_amount || 0)}</span>
            </div>
            <div className="flex justify-between py-2 font-bold border-t-2 border-black mt-2 text-sm">
              <span>TOTAL:</span>
              <span>{formatCurrency(creditNote.total_amount || 0)}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Notes */}
      {creditNote.notes && (
        <div className="mb-2 bg-gray-50 border border-gray-200 p-2 rounded">
          <span className="font-semibold">Notes:</span> {creditNote.notes}
        </div>
      )}
      {/* Footer */}
      <div className="text-center text-xs text-gray-600 border-t-2 border-black pt-2">
        <p className="font-semibold">This is a computer generated credit note.</p>
        <p>Generated from www.invoiceninja.in</p>
      </div>
    </div>
  );
};

export default TallyCreditNoteView;
