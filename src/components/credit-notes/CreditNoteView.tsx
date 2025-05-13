
import React, { useRef } from 'react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency, formatAmount, amountToWords } from '@/lib/utils';

interface CreditNoteViewProps {
  creditNote: any;
  company: any;
  invoice: any;
  customer: any;
  isDownloadable?: boolean;
}

const CreditNoteView: React.FC<CreditNoteViewProps> = ({ 
  creditNote, 
  company, 
  invoice, 
  customer,
  isDownloadable = true 
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  
  if (!creditNote || !company) {
    return (
      <div className="p-6 text-center">
        <p>Loading credit note details...</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = async () => {
    if (!printRef.current) return;
    
    try {
      toast({ title: "Generating PDF", description: "Please wait while we prepare your credit note..." });
      
      const options = {
        filename: `Credit-Note-${creditNote.credit_note_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(options).from(printRef.current).save();
      
      toast({ title: "Download complete", description: "Credit note has been downloaded as PDF." });
    } catch (error) {
      console.error('Error generating credit note PDF:', error);
      toast({ 
        title: "Download failed", 
        description: "Failed to generate PDF. Please try again.", 
        variant: "destructive" 
      });
    }
  };
  
  // Calculate totals
  const subtotal = creditNote.subtotal || 0;
  const cgst = creditNote.cgst || 0;
  const sgst = creditNote.sgst || 0;
  const igst = creditNote.igst || 0;
  const totalAmount = creditNote.total_amount || 0;

  return (
    <div className="bg-white">
      {isDownloadable && (
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload} title="Download Credit Note">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      )}
      
      <div 
        ref={printRef} 
        className="bg-white p-8 max-w-4xl mx-auto shadow-sm border rounded-md print:shadow-none print:border-none"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">CREDIT NOTE</h1>
            <p className="text-gray-500"># {creditNote.credit_note_number || 'N/A'}</p>
            <p className="text-gray-500 mt-2">Date: {creditNote.credit_note_date ? format(new Date(creditNote.credit_note_date), 'dd/MM/yyyy') : 'N/A'}</p>
            {invoice && (
              <p className="text-gray-500">Reference Invoice: {invoice.invoice_number || 'N/A'}</p>
            )}
          </div>
          
          <div className="text-right">
            <div className="flex items-start gap-3 justify-end">
              {company.logo && (
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`} 
                  className="h-12 w-auto object-contain" 
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-800">{company.name}</h2>
                <p className="text-sm text-gray-600">{company.address_line1}</p>
                {company.address_line2 && <p className="text-sm text-gray-600">{company.address_line2}</p>}
                <p className="text-sm text-gray-600">{company.city}, {company.state} - {company.pincode}</p>
                <p className="text-sm text-gray-600">GSTIN: {company.gstin}</p>
                {company.email && <p className="text-sm text-gray-600">Email: {company.email}</p>}
                {company.phone && <p className="text-sm text-gray-600">Phone: {company.phone}</p>}
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {customer && (
            <>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Bill To:</h3>
                <p className="font-medium">{customer.name}</p>
                <p>{customer.billing_address_line1}</p>
                {customer.billing_address_line2 && <p>{customer.billing_address_line2}</p>}
                <p>{customer.billing_city}, {customer.billing_state} {customer.billing_pincode}</p>
                {customer.gstin && <p>GSTIN: {customer.gstin}</p>}
                {customer.email && <p>Email: {customer.email}</p>}
                {customer.phone && <p>Phone: {customer.phone}</p>}
              </div>
              
              {(customer.shipping_address_line1 || customer.shipping_city) && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Ship To:</h3>
                  <p className="font-medium">{customer.name}</p>
                  <p>{customer.shipping_address_line1 || customer.billing_address_line1}</p>
                  {customer.shipping_address_line2 && <p>{customer.shipping_address_line2}</p>}
                  <p>
                    {customer.shipping_city || customer.billing_city}, 
                    {customer.shipping_state || customer.billing_state} 
                    {customer.shipping_pincode || customer.billing_pincode}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Credit Note Items - Match the layout from screenshot 2 */}
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
              {Array.isArray(creditNote.items) && creditNote.items.map((item: any, index: number) => {
                const itemAmount = item.price * item.quantity;
                const gstRate = item.gst_rate || 0;
                const gstAmount = (itemAmount * gstRate) / 100;
                const totalWithGst = itemAmount + gstAmount;
                
                return (
                  <tr key={item.id || index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-2 border text-sm">{index + 1}</td>
                    <td className="py-2 px-2 border text-sm">
                      <div className="font-medium">{item.product_name}</div>
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
        
        {/* Summary */}
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
        
        {/* Amount in words */}
        <div className="mb-6 border p-3 bg-gray-50 rounded">
          <p><span className="font-medium">Amount in words:</span> {amountToWords(totalAmount)}</p>
        </div>
        
        {/* Reason for credit note */}
        {creditNote.reason && (
          <div className="mb-6">
            <h4 className="font-semibold mb-1">Reason:</h4>
            <p className="whitespace-pre-line">{creditNote.reason}</p>
          </div>
        )}
        
        {/* Bank Details */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold mb-1">Bank Details:</h4>
          <p className="text-sm">
            {company.bank_account_name} ({company.bank_account_number}) | {company.bank_name}, {company.bank_branch} | IFSC: {company.bank_ifsc_code}
          </p>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>This is a computer generated credit note.</p>
        </div>
      </div>
    </div>
  );
};

export default CreditNoteView;
