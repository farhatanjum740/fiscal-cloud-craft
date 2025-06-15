
import React from "react";

interface ZohoCreditNoteViewProps {
  creditNote: any;
  company: any;
  invoice: any;
  customer: any;
  isDownloadable?: boolean;
}

const ZohoCreditNoteView: React.FC<ZohoCreditNoteViewProps> = ({
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

  // Clean, gray/blue accent, sleek
  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Zoho Header with Blue Gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-light">CREDIT NOTE</h1>
            <div className="text-blue-100 mt-2">#{creditNote.creditNoteNumber || 'DRAFT'}</div>
            <div className="text-blue-100 mt-2">Date: {formatDate(creditNote.creditNoteDate)}</div>
            <div className="text-blue-100 mt-2">Reference Invoice: {invoice?.invoice_number || "N/A"}</div>
            <div className="text-blue-100 mt-2">Invoice Date: {formatDate(invoice?.invoice_date)}</div>
            {creditNote.reason && <div className="text-blue-100 mt-2">Reason: {creditNote.reason}</div>}
          </div>
          <div className="text-right">
            {company?.logo && (
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="h-12 w-auto object-contain mb-3 ml-auto"
              />
            )}
            <div className="text-xl font-light">{company?.name}</div>
            <div className="text-sm text-blue-100">{company?.address}</div>
            <div className="text-sm text-blue-100">
              {company?.city}, {company?.state} - {company?.pincode}
            </div>
            {company?.gstin && <div className="text-sm text-blue-100">GSTIN: {company.gstin}</div>}
            {company?.email && <div className="text-sm text-blue-100">Email: {company.email}</div>}
            {company?.phone && <div className="text-sm text-blue-100">Phone: {company.phone}</div>}
          </div>
        </div>
      </div>

      {/* Customer Card */}
      <div className="px-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-light text-gray-800 mb-3">Bill To</h2>
          <div className="text-gray-600 space-y-1">
            <div className="font-medium text-gray-900">{customer?.name || 'Customer Name'}</div>
            {customer?.address && <div className="text-gray-600 text-sm">{customer.address}</div>}
            {customer?.city && <div className="text-gray-600 text-sm">{customer.city}, {customer?.state} {customer?.pincode}</div>}
            {customer?.gstin && (
              <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs inline-block">
                GSTIN: {customer.gstin}
              </div>
            )}
            {customer?.email && <div className="text-gray-600 text-sm">Email: {customer.email}</div>}
            {customer?.phone && <div className="text-gray-600 text-sm">Phone: {customer.phone}</div>}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Item & Description</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-700">Qty</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">Rate</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">Tax %</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {creditNote.items?.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{item.description}</div>
                      {item.hsn_code && (
                        <div className="text-sm text-gray-500 mt-1">HSN: {item.hsn_code}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-4 px-6 text-right text-gray-700">{formatCurrency(item.rate)}</td>
                    <td className="py-4 px-6 text-right">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                        {item.tax_percentage}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 mb-8">
        <div className="flex justify-end">
          <div className="w-full max-w-sm">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(creditNote.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Tax Amount</span>
                  <span className="text-gray-900">{formatCurrency(creditNote.tax_amount || 0)}</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Total Credit</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(creditNote.total_amount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Notes & Footer */}
      <div className="px-6 pb-6">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <div className="text-blue-700 font-medium mb-2">CREDIT NOTE</div>
          <div className="text-gray-600 text-sm">
            This credit note has been generated digitally and is valid without signature.
          </div>
          {creditNote.notes && (
            <div className="mt-4 bg-white rounded p-4 text-left">
              <h4 className="font-medium text-gray-800 mb-2">Notes:</h4>
              <p className="text-gray-700 text-sm">{creditNote.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZohoCreditNoteView;
