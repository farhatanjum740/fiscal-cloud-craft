
import React from 'react';
import { formatAmount } from '@/lib/utils';

interface CreditNoteItemsTableProps {
  items: any[];
  useIGST?: boolean;
}

const CreditNoteItemsTable: React.FC<CreditNoteItemsTableProps> = ({ items, useIGST = false }) => {
  console.log("Credit Note Items Table Props:", { items, useIGST });
  
  return (
    <div className="w-full overflow-hidden print:overflow-hidden">
      <table className="w-full border-collapse mb-5 text-xs" style={{ tableLayout: 'fixed', maxWidth: '200mm' }}>
        <thead>
          <tr className="bg-gray-100">
            <th className="py-1 px-1 border font-semibold" style={{ width: '5%' }}>No</th>
            <th className="py-1 px-1 border font-semibold" style={{ width: '25%' }}>Item</th>
            <th className="py-1 px-1 border font-semibold" style={{ width: '10%' }}>HSN/SAC</th>
            <th className="py-1 px-1 border font-semibold" style={{ width: '7%' }}>Qty</th>
            <th className="py-1 px-1 border font-semibold" style={{ width: '8%' }}>Unit</th>
            <th className="py-1 px-1 border font-semibold" style={{ width: '10%' }}>Rate</th>
            <th className="py-1 px-1 border font-semibold" style={{ width: '10%' }}>Amount</th>
            {useIGST ? (
              <>
                <th className="py-1 px-1 border font-semibold" style={{ width: '7%' }}>IGST %</th>
                <th className="py-1 px-1 border font-semibold" style={{ width: '8%' }}>IGST</th>
              </>
            ) : (
              <>
                <th className="py-1 px-1 border font-semibold" style={{ width: '5%' }}>CGST %</th>
                <th className="py-1 px-1 border font-semibold" style={{ width: '5%' }}>CGST</th>
                <th className="py-1 px-1 border font-semibold" style={{ width: '5%' }}>SGST %</th>
                <th className="py-1 px-1 border font-semibold" style={{ width: '5%' }}>SGST</th>
              </>
            )}
            <th className="py-1 px-1 border font-semibold text-right" style={{ width: '10%' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(items) && items.length > 0 ? (
            items.map((item: any, index: number) => {
              // Extract values with proper fallbacks
              const itemPrice = Number(item.price || 0);
              const itemQuantity = Number(item.quantity || 0);
              const itemAmount = itemPrice * itemQuantity;
              const gstRate = Number(item.gst_rate || item.gstRate || 0);
              const gstAmount = (itemAmount * gstRate) / 100;
              const totalWithGst = itemAmount + gstAmount;
              
              // Calculate split rates for CGST/SGST (half of GST rate for each)
              const splitRate = gstRate / 2;
              const splitAmount = gstAmount / 2;
              
              // Get item name and HSN code from the appropriate properties
              const productName = item.product_name || item.productName || 'N/A';
              const hsnCode = item.hsn_code || item.hsnCode || 'N/A';
              
              console.log(`Rendering item ${index}:`, {
                productName,
                hsnCode,
                itemPrice,
                itemQuantity,
                gstRate,
                gstAmount
              });
              
              return (
                <tr key={item.id || index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-1 px-1 border text-xs">{index + 1}</td>
                  <td className="py-1 px-1 border text-xs">
                    <div className="font-medium">{productName}</div>
                  </td>
                  <td className="py-1 px-1 border text-xs">{hsnCode}</td>
                  <td className="py-1 px-1 border text-xs">{itemQuantity}</td>
                  <td className="py-1 px-1 border text-xs">{item.unit || 'Unit'}</td>
                  <td className="py-1 px-1 border text-xs">₹{formatAmount(itemPrice)}</td>
                  <td className="py-1 px-1 border text-xs">₹{formatAmount(itemAmount)}</td>
                  
                  {useIGST ? (
                    <>
                      <td className="py-1 px-1 border text-xs">{gstRate}%</td>
                      <td className="py-1 px-1 border text-xs">₹{formatAmount(gstAmount)}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-1 px-1 border text-xs">{splitRate}%</td>
                      <td className="py-1 px-1 border text-xs">₹{formatAmount(splitAmount)}</td>
                      <td className="py-1 px-1 border text-xs">{splitRate}%</td>
                      <td className="py-1 px-1 border text-xs">₹{formatAmount(splitAmount)}</td>
                    </>
                  )}
                  <td className="py-1 px-1 border text-xs text-right">₹{formatAmount(totalWithGst)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={useIGST ? 10 : 12} className="py-2 text-center border text-xs">
                No items found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CreditNoteItemsTable;
