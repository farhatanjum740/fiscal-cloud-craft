
import React, { useRef } from 'react';
import { format } from 'date-fns';
import { toPng } from 'html-to-image';
import { Printer, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency, formatAmount } from '@/lib/utils';

interface InvoiceViewProps {
  invoice: any;
  company: any;
  customer: any;
  isDownloadable?: boolean;
}

// Helper function to convert amount to words
const amountInWords = (amount: number): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });
  
  return `${formatter.format(amount)} only`;
};

export const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, company, customer, isDownloadable = true }) => {
  const printRef = useRef<HTMLDivElement>(null);
  
  if (!invoice || !company || !customer) {
    return (
      <div className="p-6 text-center">
        <p>Loading invoice details...</p>
      </div>
    );
  }
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = async () => {
    if (!printRef.current) return;
    
    try {
      toast({ title: "Generating PDF", description: "Please wait while we prepare your invoice..." });
      
      const dataUrl = await toPng(printRef.current, { quality: 1.0, backgroundColor: 'white' });
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.download = `Invoice-${invoice.invoiceNumber}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({ title: "Download complete", description: "Invoice has been downloaded successfully." });
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      toast({ 
        title: "Download failed", 
        description: "Failed to generate PDF. Please try again.", 
        variant: "destructive" 
      });
    }
  };
  
  // Calculate GST amounts - handle potential undefined values
  const hasIGST = ((invoice.taxAmount?.igst || invoice.igst) || 0) > 0;
  const hasCGSTSGST = ((invoice.taxAmount?.cgst || invoice.cgst) || 0) > 0 || ((invoice.taxAmount?.sgst || invoice.sgst) || 0) > 0;
  
  // Round to nearest rupee - ensure we're working with numbers
  const totalAmount = typeof invoice.totalAmount === 'number' ? invoice.totalAmount : 0;
  const roundedTotal = Math.round(totalAmount);
  const roundOffAmount = roundedTotal - totalAmount;

  return (
    <div className="bg-white">
      {isDownloadable && (
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      )}
      
      <div ref={printRef} className="bg-white p-8 max-w-4xl mx-auto shadow-sm border rounded-md print:shadow-none print:border-none">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
            <p className="text-gray-500"># {invoice.invoiceNumber}</p>
            <p className="text-gray-500 mt-2">Date: {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'dd/MM/yyyy') : ''}</p>
            {invoice.dueDate && (
              <p className="text-gray-500">Due Date: {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</p>
            )}
          </div>
          
          <div className="text-right flex items-center gap-3">
            {company.logo && (
              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="h-12 w-auto object-contain" 
              />
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">{company.name}</h2>
              <p className="text-sm text-gray-600">{company.address?.line1}</p>
              {company.address?.line2 && <p className="text-sm text-gray-600">{company.address.line2}</p>}
              <p className="text-sm text-gray-600">{company.address?.city}, {company.address?.state} {company.address?.pincode}</p>
              <p className="text-sm text-gray-600">GSTIN: {company.gstin}</p>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-6 mb-6">
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
        </div>
        
        {/* Invoice Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border font-semibold">Item</th>
                <th className="py-3 px-4 border font-semibold">HSN/SAC</th>
                <th className="py-3 px-4 border font-semibold">Qty</th>
                <th className="py-3 px-4 border font-semibold">Unit</th>
                <th className="py-3 px-4 border font-semibold">Rate</th>
                <th className="py-3 px-4 border font-semibold">GST %</th>
                <th className="py-3 px-4 border font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(invoice.items) && invoice.items.map((item: any, index: number) => {
                // Ensure we're working with numbers
                const price = typeof item.price === 'number' ? item.price : 0;
                const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                
                return (
                  <tr key={item.id || index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-3 px-4 border">
                      <div className="font-medium">{item.productName}</div>
                      {item.description && <div className="text-sm text-gray-600">{item.description}</div>}
                    </td>
                    <td className="py-3 px-4 border">{item.hsnCode}</td>
                    <td className="py-3 px-4 border">{item.quantity}</td>
                    <td className="py-3 px-4 border">{item.unit}</td>
                    <td className="py-3 px-4 border">₹{formatAmount(price)}</td>
                    <td className="py-3 px-4 border">{item.gstRate}%</td>
                    <td className="py-3 px-4 border text-right">₹{formatAmount(price * quantity)}</td>
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
              <span>₹{formatAmount(invoice.subtotal || 0)}</span>
            </div>
            
            {hasCGSTSGST && (
              <>
                <div className="flex justify-between py-2">
                  <span>CGST:</span>
                  <span>₹{formatAmount((invoice.taxAmount?.cgst || invoice.cgst || 0))}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>SGST:</span>
                  <span>₹{formatAmount((invoice.taxAmount?.sgst || invoice.sgst || 0))}</span>
                </div>
              </>
            )}
            
            {hasIGST && (
              <div className="flex justify-between py-2">
                <span>IGST:</span>
                <span>₹{formatAmount((invoice.taxAmount?.igst || invoice.igst || 0))}</span>
              </div>
            )}
            
            {roundOffAmount !== 0 && (
              <div className="flex justify-between py-2">
                <span>Round off:</span>
                <span>₹{formatAmount(roundOffAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 font-bold border-t border-gray-300 mt-2">
              <span>Total:</span>
              <span>₹{formatAmount(roundedTotal)}</span>
            </div>
          </div>
        </div>
        
        {/* Amount in words */}
        <div className="mb-6 border p-3 bg-gray-50 rounded">
          <p><span className="font-medium">Amount in words:</span> {amountInWords(roundedTotal)}</p>
        </div>
        
        {/* Notes and Terms */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {invoice.termsAndConditions && (
            <div>
              <h4 className="font-semibold mb-1">Terms & Conditions:</h4>
              <p className="text-sm whitespace-pre-line">{invoice.termsAndConditions}</p>
            </div>
          )}
          
          {invoice.notes && (
            <div>
              <h4 className="font-semibold mb-1">Notes:</h4>
              <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>
        
        {/* Bank Details */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold mb-2">Bank Details:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">Account Name:</span> {company.bankDetails?.accountName}</p>
              <p><span className="font-medium">Account Number:</span> {company.bankDetails?.accountNumber}</p>
            </div>
            <div>
              <p><span className="font-medium">Bank Name:</span> {company.bankDetails?.bankName}</p>
              <p><span className="font-medium">IFSC Code:</span> {company.bankDetails?.ifscCode}</p>
              <p><span className="font-medium">Branch:</span> {company.bankDetails?.branch}</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>This is a computer generated invoice.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
