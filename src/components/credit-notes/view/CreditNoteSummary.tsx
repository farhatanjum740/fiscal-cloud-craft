
import React from 'react';
import { formatAmount, amountToWords } from '@/lib/utils';

interface CreditNoteSummaryProps {
  subtotal: number | null;
  cgst: number | null;
  sgst: number | null;
  igst: number | null;
  totalAmount: number | null;
  useIGST?: boolean;
}

const CreditNoteSummary: React.FC<CreditNoteSummaryProps> = ({ 
  subtotal = 0,
  cgst = 0,
  sgst = 0,
  igst = 0,
  totalAmount = 0,
  useIGST = false
}) => {
  // Ensure we have numbers, not null values
  const safeSubtotal = Number(subtotal) || 0;
  const safeCgst = Number(cgst) || 0;
  const safeSgst = Number(sgst) || 0;
  const safeIgst = Number(igst) || 0;
  const safeTotalAmount = Number(totalAmount) || 0;
  
  console.log("Credit Note Summary:", {
    safeSubtotal,
    safeCgst,
    safeSgst,
    safeIgst,
    safeTotalAmount,
    useIGST
  });
  
  return (
    <>
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>₹{formatAmount(safeSubtotal)}</span>
          </div>
          
          {!useIGST ? (
            <>
              <div className="flex justify-between py-2">
                <span>CGST:</span>
                <span>₹{formatAmount(safeCgst)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>SGST:</span>
                <span>₹{formatAmount(safeSgst)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between py-2">
              <span>IGST:</span>
              <span>₹{formatAmount(safeIgst)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 font-bold border-t border-gray-300 mt-2">
            <span>Total:</span>
            <span>₹{formatAmount(safeTotalAmount)}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-6 border p-3 bg-gray-50 rounded">
        <p><span className="font-medium">Amount in words:</span> {amountToWords(safeTotalAmount)}</p>
      </div>
    </>
  );
};

export default CreditNoteSummary;
