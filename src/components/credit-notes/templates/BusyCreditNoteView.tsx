
import React from "react";

interface BusyCreditNoteViewProps {
  creditNote: any;
  company: any;
  invoice: any;
  customer: any;
  isDownloadable?: boolean;
}

const BusyCreditNoteView: React.FC<BusyCreditNoteViewProps> = ({
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

  // Busy: blue-to-blue gradient header, white rounded cards, blue summary, modern table
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">CREDIT NOTE</h1>
            <p className="text-blue-100 mt-1">Credit Note #: {creditNote.creditNoteNumber || 'DRAFT'}</p>
            <div className="text-base mb-0">Date: {formatDate(creditNote.creditNoteDate)}</div>
            <div className="text-xs">Reference Invoice: {invoice?.invoice_number || 'N/A'}</div>
            <div className="text-xs">Invoice Date: {formatDate(invoice?.invoice_date)}</div>
            {creditNote.reason && <div className="text-xs">Reason: {creditNote.reason}</div>}
          </div>
          {/* Company at header right */}
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
              <div className="text-xs text-gray-200">{company?.address}</div>
              {company?.city && <div className="text-xs text-gray-200">{company.city}, {company?.state} - {company?.pincode}</div>}
              <div className="text-xs text-gray-200">GSTIN: {company?.gstin}</div>
              {company?.phone && <div className="text-xs text-gray-200">Phone: {company.phone}</div>}
              {company?.email && <div className="text-xs text-gray-200">Email: {company.email}</div>}
            </div>
          </div>
        </div>
      </div>
      {/* Customer & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
          <h3 className="font-bold text-blue-700 text-lg mb-3 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            CREDIT TO
          </h3>
          <div className="space-y-2 text-gray-700">
            <div className="font-bold text-lg text-gray-900">{customer?.name || 'Customer Name'}</div>
            {customer?.address && <div className="text-sm">{customer.address}</div>}
            {customer?.city && <div className="text-sm">{customer.city}, {customer?.state} {customer?.pincode}</div>}
            {customer?.gstin && (
              <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs inline-block">
                GSTIN: {customer.gstin}
              </div>
            )}
            {customer?.phone && <div className="text-sm">📞 {customer.phone}</div>}
            {customer?.email && <div className="text-sm">✉️ {customer.email}</div>}
          </div>
        </div>
        <div>
          {/* No need for extra info card, header already includes it */}
        </div>
      </div>
      {/* Table */}
      <div className="mx-6 mb-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
            <h3 className="font-bold text-lg">Credit Note Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Description</th>
                  <th className="text-center p-4 font-semibold text-gray-700">Quantity</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Rate</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Tax %</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {creditNote.items?.map((item: any, index: number) => (
                  <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="p-4">
                      <div className="font-medium">{item.description}</div>
                      {item.hsn_code && (
                        <div className="text-sm text-gray-500">HSN: {item.hsn_code}</div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium">{formatCurrency(item.rate)}</td>
                    <td className="p-4 text-right">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {item.tax_percentage}%
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-lg">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Totals */}
      <div className="mx-6 mb-6">
        <div className="flex justify-end">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-lg w-full max-w-sm">
            <h3 className="font-bold text-blue-700 text-lg mb-4 text-center">Credit Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-blue-200">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium">{formatCurrency(creditNote.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-200">
                <span className="text-gray-700">Tax Amount:</span>
                <span className="font-medium">{formatCurrency(creditNote.tax_amount || 0)}</span>
              </div>
              <div className="flex justify-between py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-4 font-bold text-lg">
                <span>TOTAL CREDIT:</span>
                <span>{formatCurrency(creditNote.total_amount || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-b-lg">
        <div className="text-center">
          <div className="bg-blue-600 text-white inline-block px-4 py-2 rounded-full font-bold mb-3">
            ★ CREDIT NOTE ★
          </div>
          <div className="text-sm text-gray-600">
            This is a computer generated credit note and does not require physical signature.
          </div>
          {creditNote.notes && (
            <div className="mt-4 bg-white rounded-lg p-3 text-left">
              <strong className="text-blue-700">Additional Notes:</strong>
              <div className="text-gray-700 mt-1">{creditNote.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusyCreditNoteView;
