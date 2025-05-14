
import React from 'react';
import { formatAmount } from '@/lib/utils';

interface CreditNoteItemsTableProps {
  items: any[];
}

const CreditNoteItemsTable: React.FC<CreditNoteItemsTableProps> = ({ items }) => {
  return (
    <div className="w-full overflow-visible print:overflow-visible">
      <table className="w-full text-left border-collapse mb-6 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-2 border font-semibold">S.No</th>
            <th className="py-2 px-2 border font-semibold">Item</th>
            <th className="py-2 px-2 border font-semibold">HSN/SAC</th>
            <th className="py-2 px-2 border font-semibold">Qty</th>
            <th className="py-2 px-2 border font-semibold">Unit</th>
            <th className="py-2 px-2 border font-semibold">Rate</th>
            <th className="py-2 px-2 border font-semibold">Amount</th>
            <th className="py-2 px-2 border font-semibold">GST %</th>
            <th className="py-2 px-2 border font-semibold">GST Amt</th>
            <th className="py-2 px-2 border font-semibold text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(items) && items.map((item: any, index: number) => {
            const itemAmount = item.price * item.quantity;
            const gstRate = item.gst_rate || 0;
            const gstAmount = (itemAmount * gstRate) / 100;
            const totalWithGst = itemAmount + gstAmount;
            
            return (
              <tr key={item.id || index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 px-2 border text-sm">{index + 1}</td>
                <td className="py-2 px-2 border text-sm">
                  <div className="font-medium">{item.product_name || 'N/A'}</div>
                </td>
                <td className="py-2 px-2 border text-sm">{item.hsn_code || 'N/A'}</td>
                <td className="py-2 px-2 border text-sm">{item.quantity}</td>
                <td className="py-2 px-2 border text-sm">{item.unit || 'Unit'}</td>
                <td className="py-2 px-2 border text-sm">₹{formatAmount(item.price)}</td>
                <td className="py-2 px-2 border text-sm">₹{formatAmount(itemAmount)}</td>
                <td className="py-2 px-2 border text-sm">{gstRate}%</td>
                <td className="py-2 px-2 border text-sm">₹{formatAmount(gstAmount)}</td>
                <td className="py-2 px-2 border text-sm text-right">₹{formatAmount(totalWithGst)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CreditNoteItemsTable;
