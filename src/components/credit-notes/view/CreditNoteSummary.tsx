
import React from 'react';
import { formatAmount, amountToWords } from '@/lib/utils';

interface CreditNoteSummaryProps {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

const CreditNoteSummary: React.FC<CreditNoteSummaryProps> = ({ 
  subtotal,
  cgst,
  sgst,
  igst,
  totalAmount
}) => {
  return (
    <>
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>₹{formatAmount(subtotal)}</span>
          </div>
          
          {cgst > 0 && (
            <div className="flex justify-between py-2">
              <span>CGST:</span>
              <span>₹{formatAmount(cgst)}</span>
            </div>
          )}
          
          {sgst > 0 && (
            <div className="flex justify-between py-2">
              <span>SGST:</span>
              <span>₹{formatAmount(sgst)}</span>
            </div>
          )}
          
          {igst > 0 && (
            <div className="flex justify-between py-2">
              <span>IGST:</span>
              <span>₹{formatAmount(igst)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 font-bold border-t border-gray-300 mt-2">
            <span>Total:</span>
            <span>₹{formatAmount(totalAmount)}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-6 border p-3 bg-gray-50 rounded">
        <p><span className="font-medium">Amount in words:</span> {amountToWords(totalAmount)}</p>
      </div>
    </>
  );
};

export default CreditNoteSummary;
