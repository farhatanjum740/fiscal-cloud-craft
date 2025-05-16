
import React, { useEffect } from 'react';
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
  const safeSubtotal = parseFloat(String(subtotal)) || 0;
  const safeCgst = parseFloat(String(cgst)) || 0;
  const safeSgst = parseFloat(String(sgst)) || 0;
  const safeIgst = parseFloat(String(igst)) || 0;
  const safeTotalAmount = parseFloat(String(totalAmount)) || 0;
  
  useEffect(() => {
    console.log("Credit Note Summary - Original Values:", {
      subtotal, cgst, sgst, igst, totalAmount, useIGST
    });
    
    console.log("Credit Note Summary - Safe Values:", {
      safeSubtotal, safeCgst, safeSgst, safeIgst, safeTotalAmount
    });
  }, [subtotal, cgst, sgst, igst, totalAmount, useIGST]);
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <div className="w-60">
          <div className="flex justify-between py-1 text-xs">
            <span>Subtotal:</span>
            <span>₹{formatAmount(safeSubtotal)}</span>
          </div>
          
          {!useIGST ? (
            <>
              <div className="flex justify-between py-1 text-xs">
                <span>CGST:</span>
                <span>₹{formatAmount(safeCgst)}</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span>SGST:</span>
                <span>₹{formatAmount(safeSgst)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between py-1 text-xs">
              <span>IGST:</span>
              <span>₹{formatAmount(safeIgst)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-1 font-bold border-t border-gray-300 mt-1 text-xs">
            <span>Total:</span>
            <span>₹{formatAmount(safeTotalAmount)}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4 border p-2 bg-gray-50 rounded text-xs">
        <p><span className="font-medium">Amount in words:</span> {amountToWords(safeTotalAmount)}</p>
      </div>
    </>
  );
};

export default CreditNoteSummary;
