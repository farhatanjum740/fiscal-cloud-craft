
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
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border-4 border-green-600">
      {/* Tally Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wider">CREDIT NOTE</h1>
          <div className="text-sm mt-1">Credit Note No: {creditNote.creditNoteNumber || 'DRAFT'}</div>
        </div>
      </div>

      {/* Traditional Tally Layout */}
      <div className="p-6">
        {/* Company Header */}
        <div className="text-center border-b-2 border-green-600 pb-4 mb-6">
          <h2 className="text-xl font-bold text-green-700">{company?.name || 'Company Name'}</h2>
          <div className="text-sm text-gray-600 mt-1">
            {company?.address && <div>{company.address}</div>}
            {company?.city && <div>{company.city}, {company?.state} {company?.pincode}</div>}
            {company?.gstin && <div>GSTIN: {company.gstin}</div>}
          </div>
        </div>

        {/* Credit Note Details in Tally Style */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <div className="flex">
              <span className="font-semibold w-32">Date:</span>
              <span>{formatDate(creditNote.creditNoteDate)}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-32">Ref. Invoice:</span>
              <span>{invoice?.invoice_number || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-32">Invoice Date:</span>
              <span>{formatDate(invoice?.invoice_date)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-semibold w-32">Status:</span>
              <span className="text-green-600 font-medium">{creditNote.status?.toUpperCase()}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-32">Reason:</span>
              <span>{creditNote.reason || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="border border-green-300 p-4 mb-6">
          <h3 className="font-bold text-green-700 mb-2">PARTY DETAILS:</h3>
          <div className="font-semibold">{customer?.name || 'Customer Name'}</div>
          {customer?.address && <div className="text-sm">{customer.address}</div>}
          {customer?.city && <div className="text-sm">{customer.city}, {customer?.state} {customer?.pincode}</div>}
          {customer?.gstin && <div className="text-sm">GSTIN: {customer.gstin}</div>}
        </div>

        {/* Items Table - Traditional Tally Style */}
        <div className="border-2 border-green-600 mb-6">
          <div className="bg-green-100 p-2">
            <h3 className="font-bold text-green-800">PARTICULARS</h3>
          </div>
          <table className="w-full">
            <thead className="bg-green-50">
              <tr className="border-b border-green-300">
                <th className="text-left p-3 border-r border-green-300 font-semibold">Description</th>
                <th className="text-center p-3 border-r border-green-300 font-semibold">Qty</th>
                <th className="text-right p-3 border-r border-green-300 font-semibold">Rate</th>
                <th className="text-right p-3 border-r border-green-300 font-semibold">Tax%</th>
                <th className="text-right p-3 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {creditNote.items?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-green-200">
                  <td className="p-3 border-r border-green-200">
                    <div>{item.description}</div>
                    {item.hsn_code && <div className="text-xs text-gray-500">HSN: {item.hsn_code}</div>}
                  </td>
                  <td className="p-3 text-center border-r border-green-200">{item.quantity}</td>
                  <td className="p-3 text-right border-r border-green-200">{formatCurrency(item.rate)}</td>
                  <td className="p-3 text-right border-r border-green-200">{item.tax_percentage}%</td>
                  <td className="p-3 text-right font-semibold">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals in Traditional Format */}
        <div className="flex justify-end">
          <div className="border-2 border-green-600 w-80">
            <div className="bg-green-100 p-2 border-b border-green-600">
              <h3 className="font-bold text-green-800">TOTAL</h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between border-b border-green-200 pb-1">
                <span>Sub Total:</span>
                <span>{formatCurrency(creditNote.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between border-b border-green-200 pb-1">
                <span>Tax Amount:</span>
                <span>{formatCurrency(creditNote.tax_amount || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg bg-green-50 p-2 rounded">
                <span>CREDIT TOTAL:</span>
                <span>{formatCurrency(creditNote.total_amount || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600 border-t border-green-300 pt-4">
          <div className="font-semibold text-green-700 mb-2">*** CREDIT NOTE ***</div>
          <div>Computer Generated Credit Note - No Signature Required</div>
          {creditNote.notes && (
            <div className="mt-3 text-left bg-green-50 p-3 rounded">
              <strong>Notes:</strong> {creditNote.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TallyCreditNoteView;
