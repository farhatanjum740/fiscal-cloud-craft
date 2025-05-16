
import React from "react";

interface InvoiceSummaryProps {
  subtotal: number;
  gstDetails: { cgst: number; sgst: number; igst: number };
  total: number;
}

const InvoiceSummary = ({ subtotal, gstDetails, total }: InvoiceSummaryProps) => {
  return (
    <div className="mt-6 flex justify-end">
      <div className="w-80 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal:</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {gstDetails.cgst > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">CGST:</span>
            <span>₹{gstDetails.cgst.toFixed(2)}</span>
          </div>
        )}
        {gstDetails.sgst > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">SGST:</span>
            <span>₹{gstDetails.sgst.toFixed(2)}</span>
          </div>
        )}
        {gstDetails.igst > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">IGST:</span>
            <span>₹{gstDetails.igst.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
          <span>Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
