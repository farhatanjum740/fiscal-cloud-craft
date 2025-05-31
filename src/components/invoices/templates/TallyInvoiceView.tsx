
import React, { useRef } from 'react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { Printer, Download, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency, formatAmount, amountToWords } from '@/lib/utils';

interface TallyInvoiceViewProps {
  invoice: any;
  company: any;
  customer: any;
  isDownloadable?: boolean;
}

export const TallyInvoiceView: React.FC<TallyInvoiceViewProps> = ({ invoice, company, customer, isDownloadable = true }) => {
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
        className="bg-white p-6 max-w-4xl mx-auto shadow-sm border-2 border-gray-400 rounded-none print:shadow-none print:border-none text-sm"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {/* Tally-style Header with thick border */}
        <div className="border-2 border-black p-4 mb-4">
          <div className="text-center border-b-2 border-black pb-3 mb-3">
            <div className="flex items-center justify-center gap-4">
              {company.logo && (
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`} 
                  className="h-12 w-auto object-contain" 
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-black uppercase tracking-wide">{company.name}</h2>
                <p className="text-sm font-medium text-gray-700">{company.address_line1}</p>
                {company.address_line2 && <p className="text-sm font-medium text-gray-700">{company.address_line2}</p>}
                <p className="text-sm font-medium text-gray-700">{company.city}, {company.state} - {company.pincode}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-300">
              <div className="text-left">
                <p className="text-xs font-semibold">GSTIN: {company.gstin}</p>
                {company.contact_number && (
                  <p className="text-xs flex items-center">
                    <Phone className="h-3 w-3 mr-1" /> {company.contact_number}
                  </p>
                )}
              </div>
              <div className="text-center">
                <h1 className="text-lg font-bold text-black border-2 border-black px-4 py-1">TAX INVOICE</h1>
              </div>
              <div className="text-right">
                {company.email_id && (
                  <p className="text-xs flex items-center justify-end">
                    <Mail className="h-3 w-3 mr-1" /> {company.email_id}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Invoice details in Tally style */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border border-black p-2">
              <p className="font-bold">Invoice No: {invoice.invoice_number}</p>
              <p className="font-bold">Date: {invoice.invoice_date ? format(new Date(invoice.invoice_date), 'dd/MM/yyyy') : ''}</p>
              {invoice.due_date && (
                <p className="font-bold">Due Date: {format(new Date(invoice.due_date), 'dd/MM/yyyy')}</p>
              )}
            </div>
            <div className="border border-black p-2 text-right">
              <p className="font-bold">Original for Recipient</p>
            </div>
          </div>
        </div>
        
        {/* Customer Information in Tally style */}
        <div className="border-2 border-black mb-4">
          <div className="bg-gray-100 p-2 border-b border-black">
            <h3 className="font-bold text-sm text-black">BILL TO PARTY</h3>
          </div>
          <div className="p-3">
            <p className="font-bold text-sm">{customer.name}</p>
            <p className="text-xs">{customer.billing_address_line1}</p>
            {customer.billing_address_line2 && <p className="text-xs">{customer.billing_address_line2}</p>}
            <p className="text-xs">{customer.billing_city}, {customer.billing_state} {customer.billing_pincode}</p>
            {customer.gstin && <p className="text-xs font-semibold">GSTIN: {customer.gstin}</p>}
            {customer.email && <p className="text-xs">Email: {customer.email}</p>}
            {customer.phone && <p className="text-xs">Phone: {customer.phone}</p>}
          </div>
        </div>
        
        {/* Invoice Items in Tally table style */}
        <div className="border-2 border-black mb-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-2 border-r border-black font-bold">Sl</th>
                <th className="py-2 px-2 border-r border-black font-bold">Particulars</th>
                <th className="py-2 px-2 border-r border-black font-bold">HSN</th>
                <th className="py-2 px-2 border-r border-black font-bold">Qty</th>
                <th className="py-2 px-2 border-r border-black font-bold">Unit</th>
                <th className="py-2 px-2 border-r border-black font-bold">Rate</th>
                <th className="py-2 px-2 border-r border-black font-bold">Amount</th>
                
                {useIGST ? (
                  <>
                    <th className="py-2 px-2 border-r border-black font-bold">IGST%</th>
                    <th className="py-2 px-2 border-r border-black font-bold">IGST Amt</th>
                  </>
                ) : (
                  <>
                    <th className="py-2 px-2 border-r border-black font-bold">CGST%</th>
                    <th className="py-2 px-2 border-r border-black font-bold">CGST Amt</th>
                    <th className="py-2 px-2 border-r border-black font-bold">SGST%</th>
                    <th className="py-2 px-2 border-r border-black font-bold">SGST Amt</th>
                  </>
                )}
                <th className="py-2 px-2 font-bold text-right">Total</th>
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
                  <tr key={item.id || index} className="border-b border-gray-300">
                    <td className="py-1 px-2 border-r border-gray-300 text-center">{index + 1}</td>
                    <td className="py-1 px-2 border-r border-gray-300">
                      <div className="font-medium">{item.product_name}</div>
                      {item.description && <div className="text-xs text-gray-600">{item.description}</div>}
                    </td>
                    <td className="py-1 px-2 border-r border-gray-300 text-center">{item.hsn_code}</td>
                    <td className="py-1 px-2 border-r border-gray-300 text-center">{item.quantity}</td>
                    <td className="py-1 px-2 border-r border-gray-300 text-center">{item.unit}</td>
                    <td className="py-1 px-2 border-r border-gray-300 text-right">₹{formatAmount(price)}</td>
                    <td className="py-1 px-2 border-r border-gray-300 text-right">₹{formatAmount(itemTotal)}</td>
                    
                    {useIGST ? (
                      <>
                        <td className="py-1 px-2 border-r border-gray-300 text-center">{gstRate}%</td>
                        <td className="py-1 px-2 border-r border-gray-300 text-right">₹{formatAmount(gstAmount)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-1 px-2 border-r border-gray-300 text-center">{splitRate}%</td>
                        <td className="py-1 px-2 border-r border-gray-300 text-right">₹{formatAmount(splitAmount)}</td>
                        <td className="py-1 px-2 border-r border-gray-300 text-center">{splitRate}%</td>
                        <td className="py-1 px-2 border-r border-gray-300 text-right">₹{formatAmount(splitAmount)}</td>
                      </>
                    )}
                    <td className="py-1 px-2 text-right font-semibold">₹{formatAmount(itemTotal + gstAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Summary in Tally style */}
        <div className="border-2 border-black mb-4">
          <div className="flex">
            <div className="flex-1 p-3 border-r border-black">
              <div className="border border-black p-2 text-xs">
                <p><span className="font-bold">Amount in words:</span></p>
                <p className="font-semibold">{amountToWords(roundedTotal)}</p>
              </div>
            </div>
            <div className="w-64 p-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between border-b border-gray-300 pb-1">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-semibold">₹{formatAmount(subtotal)}</span>
                </div>
                
                {!useIGST && (cgst > 0 || sgst > 0) && (
                  <>
                    <div className="flex justify-between">
                      <span>CGST:</span>
                      <span>₹{formatAmount(cgst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST:</span>
                      <span>₹{formatAmount(sgst)}</span>
                    </div>
                  </>
                )}
                
                {useIGST && igst > 0 && (
                  <div className="flex justify-between">
                    <span>IGST:</span>
                    <span>₹{formatAmount(igst)}</span>
                  </div>
                )}
                
                {roundOffAmount !== 0 && (
                  <div className="flex justify-between">
                    <span>Round off:</span>
                    <span>₹{formatAmount(roundOffAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-2 font-bold border-t-2 border-black mt-2 text-sm">
                  <span>TOTAL:</span>
                  <span>₹{formatAmount(roundedTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Terms and Bank Details */}
        <div className="border-2 border-black p-3 mb-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              {invoice.terms_and_conditions && (
                <div className="mb-3">
                  <h4 className="font-bold mb-1">Terms & Conditions:</h4>
                  <p className="whitespace-pre-line">{invoice.terms_and_conditions}</p>
                </div>
              )}
              
              {invoice.notes && (
                <div>
                  <h4 className="font-bold mb-1">Notes:</h4>
                  <p className="whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-bold mb-1">Bank Details:</h4>
              <p className="font-semibold">{company.bank_account_name}</p>
              <p>A/c No: {company.bank_account_number}</p>
              <p>{company.bank_name}, {company.bank_branch}</p>
              <p>IFSC: {company.bank_ifsc_code}</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-xs text-gray-600 border-t-2 border-black pt-2">
          <p className="font-semibold">This is a computer generated invoice.</p>
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
};

export default TallyInvoiceView;
