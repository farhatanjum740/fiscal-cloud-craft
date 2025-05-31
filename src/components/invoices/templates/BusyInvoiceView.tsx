
import React, { useRef } from 'react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { Printer, Download, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency, formatAmount, amountToWords } from '@/lib/utils';

interface BusyInvoiceViewProps {
  invoice: any;
  company: any;
  customer: any;
  isDownloadable?: boolean;
}

export const BusyInvoiceView: React.FC<BusyInvoiceViewProps> = ({ invoice, company, customer, isDownloadable = true }) => {
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
      
      const options = {
        filename: `Invoice-${invoice.invoice_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(options).from(printRef.current).save();
      
      toast({ title: "Download complete", description: "Invoice has been downloaded as PDF." });
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      toast({ 
        title: "Download failed", 
        description: "Failed to generate PDF. Please try again.", 
        variant: "destructive" 
      });
    }
  };
  
  // Determine if we should show IGST or CGST/SGST based on states
  const companyState = company.state;
  const customerState = customer?.shipping_state || customer?.billing_state || '';
  const useIGST = companyState !== customerState;
  
  // Calculate subtotal correctly - sum of all item amounts
  const subtotal = Array.isArray(invoice.items) 
    ? invoice.items.reduce((sum: number, item: any) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return sum + (price * quantity);
      }, 0)
    : 0;
  
  // Calculate GST amounts based on each item's GST rate and the determined tax type
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  
  if (Array.isArray(invoice.items)) {
    invoice.items.forEach((item: any) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      const gstRate = typeof item.gst_rate === 'number' ? item.gst_rate : 0;
      
      const itemTotal = price * quantity;
      const gstAmount = (itemTotal * gstRate) / 100;
      
      if (useIGST) {
        igst += gstAmount;
      } else {
        cgst += gstAmount / 2;
        sgst += gstAmount / 2;
      }
    });
  }
  
  // Calculate total
  const totalAmount = subtotal + cgst + sgst + igst;
  
  // Round to nearest rupee
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
          <Button variant="default" size="sm" onClick={handleDownload} title="Download Invoice">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      )}
      
      <div 
        ref={printRef} 
        className="bg-white p-6 max-w-4xl mx-auto shadow-lg border rounded-lg print:shadow-none print:border-none text-sm"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {/* Busy-style Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-t-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {company.logo && (
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`} 
                  className="h-14 w-auto object-contain bg-white p-1 rounded" 
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{company.name}</h2>
                <p className="text-sm opacity-90">{company.address_line1}</p>
                {company.address_line2 && <p className="text-sm opacity-90">{company.address_line2}</p>}
                <p className="text-sm opacity-90">{company.city}, {company.state} - {company.pincode}</p>
              </div>
            </div>
            
            <div className="text-right">
              <h1 className="text-2xl font-bold bg-white text-blue-800 px-4 py-2 rounded">INVOICE</h1>
              <p className="text-sm mt-2 opacity-90">GST Invoice</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-blue-400">
            <div>
              <p className="text-sm font-semibold">GSTIN: {company.gstin}</p>
              {company.contact_number && (
                <p className="text-sm flex items-center mt-1">
                  <Phone className="h-3 w-3 mr-1" /> {company.contact_number}
                </p>
              )}
            </div>
            <div className="text-right">
              {company.email_id && (
                <p className="text-sm flex items-center justify-end">
                  <Mail className="h-3 w-3 mr-1" /> {company.email_id}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Invoice and Customer Details in Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-bold text-blue-800 mb-2">Invoice Details</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">Invoice No:</span> {invoice.invoice_number}</p>
              <p><span className="font-semibold">Date:</span> {invoice.invoice_date ? format(new Date(invoice.invoice_date), 'dd/MM/yyyy') : ''}</p>
              {invoice.due_date && (
                <p><span className="font-semibold">Due Date:</span> {format(new Date(invoice.due_date), 'dd/MM/yyyy')}</p>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">Bill To</h3>
            <div className="text-sm">
              <p className="font-semibold text-gray-800">{customer.name}</p>
              <p className="text-gray-600">{customer.billing_address_line1}</p>
              {customer.billing_address_line2 && <p className="text-gray-600">{customer.billing_address_line2}</p>}
              <p className="text-gray-600">{customer.billing_city}, {customer.billing_state} {customer.billing_pincode}</p>
              {customer.gstin && <p className="text-sm font-semibold mt-1">GSTIN: {customer.gstin}</p>}
              {customer.email && <p className="text-sm">Email: {customer.email}</p>}
              {customer.phone && <p className="text-sm">Phone: {customer.phone}</p>}
            </div>
          </div>
        </div>
        
        {/* Invoice Items with modern table design */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
          <div className="bg-gray-100 p-3 border-b">
            <h3 className="font-bold text-gray-800">Item Details</h3>
          </div>
          
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-blue-50">
                <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">#</th>
                <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">Item Description</th>
                <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">HSN</th>
                <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">Qty</th>
                <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">Unit</th>
                <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">Rate</th>
                <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">Amount</th>
                
                {useIGST ? (
                  <>
                    <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">IGST%</th>
                    <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">IGST</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">CGST%</th>
                    <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">CGST</th>
                    <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">SGST%</th>
                    <th className="py-3 px-3 border-r border-gray-200 font-semibold text-gray-700">SGST</th>
                  </>
                )}
                <th className="py-3 px-3 font-semibold text-gray-700 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(invoice.items) && invoice.items.map((item: any, index: number) => {
                const price = typeof item.price === 'number' ? item.price : 0;
                const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                const gstRate = typeof item.gst_rate === 'number' ? item.gst_rate : 0;
                
                const itemTotal = price * quantity;
                const gstAmount = (itemTotal * gstRate) / 100;
                const splitRate = gstRate / 2;
                const splitAmount = gstAmount / 2;
                
                return (
                  <tr key={item.id || index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="py-2 px-3 border-r border-gray-200 text-center font-medium">{index + 1}</td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      <div className="font-medium text-gray-800">{item.product_name}</div>
                      {item.description && <div className="text-xs text-gray-600 mt-1">{item.description}</div>}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200 text-center">{item.hsn_code}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-center font-medium">{item.quantity}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-center">{item.unit}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-right">₹{formatAmount(price)}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-right font-medium">₹{formatAmount(itemTotal)}</td>
                    
                    {useIGST ? (
                      <>
                        <td className="py-2 px-3 border-r border-gray-200 text-center">{gstRate}%</td>
                        <td className="py-2 px-3 border-r border-gray-200 text-right">₹{formatAmount(gstAmount)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-3 border-r border-gray-200 text-center">{splitRate}%</td>
                        <td className="py-2 px-3 border-r border-gray-200 text-right">₹{formatAmount(splitAmount)}</td>
                        <td className="py-2 px-3 border-r border-gray-200 text-center">{splitRate}%</td>
                        <td className="py-2 px-3 border-r border-gray-200 text-right">₹{formatAmount(splitAmount)}</td>
                      </>
                    )}
                    <td className="py-2 px-3 text-right font-bold text-blue-800">₹{formatAmount(itemTotal + gstAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">Amount in Words</h4>
            <p className="text-sm font-semibold text-gray-800">{amountToWords(roundedTotal)}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">₹{formatAmount(subtotal)}</span>
              </div>
              
              {!useIGST && (cgst > 0 || sgst > 0) && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CGST:</span>
                    <span>₹{formatAmount(cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SGST:</span>
                    <span>₹{formatAmount(sgst)}</span>
                  </div>
                </>
              )}
              
              {useIGST && igst > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">IGST:</span>
                  <span>₹{formatAmount(igst)}</span>
                </div>
              )}
              
              {roundOffAmount !== 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Round off:</span>
                  <span>₹{formatAmount(roundOffAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-blue-800 mt-3">
                <span className="text-blue-800">TOTAL:</span>
                <span className="text-blue-800">₹{formatAmount(roundedTotal)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Terms and Bank Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            {invoice.terms_and_conditions && (
              <div className="mb-3">
                <h4 className="font-bold text-gray-800 mb-2">Terms & Conditions</h4>
                <p className="text-xs whitespace-pre-line text-gray-600">{invoice.terms_and_conditions}</p>
              </div>
            )}
            
            {invoice.notes && (
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Notes</h4>
                <p className="text-xs whitespace-pre-line text-gray-600">{invoice.notes}</p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">Bank Details</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-semibold">Account Name:</span> {company.bank_account_name}</p>
              <p><span className="font-semibold">Account No:</span> {company.bank_account_number}</p>
              <p><span className="font-semibold">Bank:</span> {company.bank_name}</p>
              <p><span className="font-semibold">Branch:</span> {company.bank_branch}</p>
              <p><span className="font-semibold">IFSC:</span> {company.bank_ifsc_code}</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center border-t-2 border-blue-800 pt-3">
          <p className="text-xs text-gray-600">This is a computer generated invoice and does not require physical signature.</p>
          <p className="text-xs text-blue-800 font-semibold mt-1">Powered by Advanced Accounting System</p>
        </div>
      </div>
    </div>
  );
};

export default BusyInvoiceView;
