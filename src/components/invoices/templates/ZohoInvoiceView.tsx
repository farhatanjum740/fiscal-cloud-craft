
import React, { useRef } from 'react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { Printer, Download, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency, formatAmount, amountToWords } from '@/lib/utils';

interface ZohoInvoiceViewProps {
  invoice: any;
  company: any;
  customer: any;
  isDownloadable?: boolean;
}

export const ZohoInvoiceView: React.FC<ZohoInvoiceViewProps> = ({ invoice, company, customer, isDownloadable = true }) => {
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
        className="bg-white p-8 max-w-4xl mx-auto shadow-xl border-0 print:shadow-none print:border-none text-sm"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {/* Zoho-style Header with clean modern design */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {company.logo && (
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                  <img 
                    src={company.logo} 
                    alt={`${company.name} logo`} 
                    className="max-h-14 max-w-14 object-contain" 
                  />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{company.name}</h2>
                <div className="text-sm text-gray-600 space-y-0.5">
                  <p>{company.address_line1}</p>
                  {company.address_line2 && <p>{company.address_line2}</p>}
                  <p>{company.city}, {company.state} {company.pincode}</p>
                  <p>GSTIN: {company.gstin}</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <h1 className="text-3xl font-light text-gray-800 mb-2">INVOICE</h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Invoice #:</span> {invoice.invoice_number}</p>
                <p><span className="font-medium">Date:</span> {invoice.invoice_date ? format(new Date(invoice.invoice_date), 'MMM dd, yyyy') : ''}</p>
                {invoice.due_date && (
                  <p><span className="font-medium">Due Date:</span> {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Contact info in a subtle way */}
          <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-3">
            <div className="flex items-center gap-4">
              {company.contact_number && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{company.contact_number}</span>
                </div>
              )}
              {company.email_id && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{company.email_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bill To Section */}
        <div className="mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Bill To</h3>
            <div className="text-sm">
              <p className="font-semibold text-gray-800 text-base mb-2">{customer.name}</p>
              <div className="text-gray-600 space-y-0.5">
                <p>{customer.billing_address_line1}</p>
                {customer.billing_address_line2 && <p>{customer.billing_address_line2}</p>}
                <p>{customer.billing_city}, {customer.billing_state} {customer.billing_pincode}</p>
                {customer.gstin && <p className="font-medium mt-2">GSTIN: {customer.gstin}</p>}
                {customer.email && <p>Email: {customer.email}</p>}
                {customer.phone && <p>Phone: {customer.phone}</p>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Invoice Items with clean table design */}
        <div className="mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="py-3 pr-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">#</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Item & Description</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide text-center">HSN</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide text-center">Qty</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide text-center">Unit</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide text-right">Rate</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide text-right">Amount</th>
                
                {useIGST ? (
                  <>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide text-center">IGST%</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide text-right">IGST</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide text-center">CGST%</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide text-right">CGST</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide text-center">SGST%</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide text-right">SGST</th>
                  </>
                )}
                <th className="py-3 pl-4 text-sm font-semibold text-gray-700 uppercase tracking-wide text-right">Total</th>
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
                  <tr key={item.id || index} className="border-b border-gray-100">
                    <td className="py-4 pr-4 text-gray-600">{index + 1}</td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-800">{item.product_name}</div>
                      {item.description && <div className="text-xs text-gray-500 mt-1">{item.description}</div>}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">{item.hsn_code}</td>
                    <td className="py-4 px-4 text-center font-medium">{item.quantity}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{item.unit}</td>
                    <td className="py-4 px-4 text-right">₹{formatAmount(price)}</td>
                    <td className="py-4 px-4 text-right font-medium">₹{formatAmount(itemTotal)}</td>
                    
                    {useIGST ? (
                      <>
                        <td className="py-4 px-4 text-center">{gstRate}%</td>
                        <td className="py-4 px-4 text-right">₹{formatAmount(gstAmount)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-4 text-center">{splitRate}%</td>
                        <td className="py-4 px-4 text-right">₹{formatAmount(splitAmount)}</td>
                        <td className="py-4 px-4 text-center">{splitRate}%</td>
                        <td className="py-4 px-4 text-right">₹{formatAmount(splitAmount)}</td>
                      </>
                    )}
                    <td className="py-4 pl-4 text-right font-semibold">₹{formatAmount(itemTotal + gstAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Summary Section */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div className="col-span-2">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3">Amount in Words</h4>
              <p className="text-sm text-gray-800 font-medium">{amountToWords(roundedTotal)}</p>
            </div>
          </div>
          
          <div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between pb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{formatAmount(subtotal)}</span>
              </div>
              
              {!useIGST && (cgst > 0 || sgst > 0) && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CGST</span>
                    <span>₹{formatAmount(cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SGST</span>
                    <span>₹{formatAmount(sgst)}</span>
                  </div>
                </>
              )}
              
              {useIGST && igst > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">IGST</span>
                  <span>₹{formatAmount(igst)}</span>
                </div>
              )}
              
              {roundOffAmount !== 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Round off</span>
                  <span>₹{formatAmount(roundOffAmount)}</span>
                </div>
              )}
              
              <div className="border-t-2 border-gray-300 pt-3 mt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{formatAmount(roundedTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Terms and Bank Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            {invoice.terms_and_conditions && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Terms & Conditions</h4>
                <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{invoice.terms_and_conditions}</p>
              </div>
            )}
            
            {invoice.notes && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Notes</h4>
                <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{invoice.notes}</p>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Bank Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Account Name:</span> {company.bank_account_name}</p>
              <p><span className="font-medium">Account Number:</span> {company.bank_account_number}</p>
              <p><span className="font-medium">Bank:</span> {company.bank_name}</p>
              <p><span className="font-medium">Branch:</span> {company.bank_branch}</p>
              <p><span className="font-medium">IFSC Code:</span> {company.bank_ifsc_code}</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500">This is a computer generated invoice and does not require physical signature.</p>
          <p className="text-xs text-gray-400 mt-2">Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
};

export default ZohoInvoiceView;
