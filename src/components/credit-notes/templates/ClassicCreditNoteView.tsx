
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

  // Monospace/typewriter theme, black border, classic
  return (
    <div className="bg-white p-6 max-w-4xl mx-auto shadow-sm border-2 border-black rounded-md font-mono text-xs" style={{ fontFamily: "Fira Mono,Courier New,monospace" }}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-lg font-bold tracking-wide mb-2">CREDIT NOTE</div>
          <div className="text-xs text-gray-600 mb-1"># {creditNote.creditNoteNumber || 'DRAFT'}</div>
          <div className="text-xs text-gray-600 mb-2">Date: {creditNote.creditNoteDate ? formatDate(creditNote.creditNoteDate) : ''}</div>
          <div className="text-xs text-gray-600 mb-1">Reference Invoice: {invoice?.invoice_number || 'N/A'}</div>
          <div className="text-xs text-gray-600 mb-1">Invoice Date: {formatDate(invoice?.invoice_date)}</div>
          {creditNote.reason && <div className="text-xs text-gray-800 mb-1">Reason: {creditNote.reason}</div>}
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          {company?.logo && (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="h-10 w-auto object-contain"
            />
          )}
          <div>
            <div className="text-base font-bold">{company?.name}</div>
            <div className="text-xs text-gray-700">{company?.address}</div>
            {company?.city && <div className="text-xs text-gray-700">{company.city}, {company?.state} - {company?.pincode}</div>}
            <div className="text-xs text-gray-700">GSTIN: {company?.gstin}</div>
            {company?.phone && <div className="text-xs text-gray-700">Phone: {company.phone}</div>}
            {company?.email && <div className="text-xs text-gray-700">Email: {company.email}</div>}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-300 my-3" />

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="font-semibold text-xs mb-1">Bill To:</div>
          <div className="font-bold">{customer?.name || 'Customer Name'}</div>
          <div className="text-xs">{customer?.address}</div>
          {customer?.city && <div className="text-xs">{customer.city}, {customer?.state} {customer?.pincode}</div>}
          {customer?.gstin && <div className="text-xs">GSTIN: {customer.gstin}</div>}
          {customer?.email && <div className="text-xs">Email: {customer.email}</div>}
          {customer?.phone && <div className="text-xs">Phone: {customer.phone}</div>}
        </div>
        <div>
          {/* Blank or Extra Info */}
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-black">
              <th className="py-2 px-2 border border-black">S.No</th>
              <th className="py-2 px-2 border border-black">Description</th>
              <th className="py-2 px-2 border border-black">HSN/SAC</th>
              <th className="py-2 px-2 border border-black">Qty</th>
              <th className="py-2 px-2 border border-black">Rate</th>
              <th className="py-2 px-2 border border-black">Tax %</th>
              <th className="py-2 px-2 border border-black">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(creditNote.items) && creditNote.items.map((item: any, idx: number) => (
              <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-1 px-2 border border-black">{idx + 1}</td>
                <td className="py-1 px-2 border border-black">
                  <div className="font-medium">{item.description}</div>
                </td>
                <td className="py-1 px-2 border border-black">{item.hsn_code}</td>
                <td className="py-1 px-2 border border-black">{item.quantity}</td>
                <td className="py-1 px-2 border border-black">{formatCurrency(Number(item.rate))}</td>
                <td className="py-1 px-2 border border-black">{item.tax_percentage}%</td>
                <td className="py-1 px-2 border border-black text-right">{formatCurrency(Number(item.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end mb-2">
        <div className="w-64">
          <div className="flex justify-between py-1 text-xs">
            <span>Subtotal:</span>
            <span>{formatCurrency(creditNote.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between py-1 text-xs">
            <span>Tax Amount:</span>
            <span>{formatCurrency(creditNote.tax_amount || 0)}</span>
          </div>
          <div className="flex justify-between py-1 font-bold border-t border-gray-300 mt-2 text-xs">
            <span>Total:</span>
            <span>{formatCurrency(creditNote.total_amount || 0)}</span>
          </div>
        </div>
      </div>
      {/* Notes */}
      {creditNote.notes && (
        <div className="mt-2 text-xs bg-gray-50 border border-gray-200 p-2 rounded">
          <span className="font-semibold">Notes:</span> {creditNote.notes}
        </div>
      )}
      {/* Footer */}
      <div className="text-center mt-6 text-xs text-gray-500">
        <p>This is a computer generated credit note.</p>
        <p>Generated from www.invoiceninja.in</p>
      </div>
    </div>
  );
};

export default ClassicCreditNoteView;
