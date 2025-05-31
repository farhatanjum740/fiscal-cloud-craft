
import React, { useRef } from 'react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { Printer, Download, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency, formatAmount, amountToWords } from '@/lib/utils';

interface ClassicInvoiceViewProps {
  invoice: any;
  company: any;
  customer: any;
  isDownloadable?: boolean;
}

export const ClassicInvoiceView: React.FC<ClassicInvoiceViewProps> = ({ invoice, company, customer, isDownloadable = true }) => {
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
        className="bg-white p-6 max-w-4xl mx-auto border border-black print:shadow-none print:border-none text-sm font-mono"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {/* Classic Header with typewriter font style */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center justify-center gap-4 mb-3">
            {company.logo && (
              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="h-12 w-auto object-contain border border-black" 
              />
            )}
            <div>
              <h2 className="text-xl font-bold uppercase tracking-widest">{company.name}</h2>
              <div className="text-xs mt-1 space-y-0.5">
                <p>{company.address_line1}</p>
                {company.address_line2 && <p>{company.address_line2}</p>}
                <p>{company.city}, {company.state} - {company.pincode}</p>
                <p>GSTIN: {company.gstin}</p>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold uppercase tracking-wider border-2 border-black inline-block px-8 py-2">INVOICE</h1>
          
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-black text-xs">
            <div className="text-left">
              {company.contact_number && (
                <p className="flex items-center">
                  TEL: {company.contact_number}
                </p>
              )}
            </div>
            <div className="text-center">
              <p className="font-bold">TAX INVOICE</p>
            </div>
            <div className="text-right">
              {company.email_id && (
                <p>EMAIL: {company.email_id}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Invoice Details and Customer Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border border-black p-3">
            <h3 className="font-bold underline mb-2">INVOICE DETAILS:</h3>
            <div className="space-y-1 text-xs">
              <p>INVOICE NO   : {invoice.invoice_number}</p>
              <p>INVOICE DATE : {invoice.invoice_date ? format(new Date(invoice.invoice_date), 'dd/MM/yyyy') : ''}</p>
              {invoice.due_date && (
                <p>DUE DATE     : {format(new Date(invoice.due_date), 'dd/MM/yyyy')}</p>
              )}
            </div>
          </div>
          
          <div className="border border-black p-3">
            <h3 className="font-bold underline mb-2">BILL TO:</h3>
            <div className="text-xs space-y-0.5">
              <p className="font-bold">{customer.name}</p>
              <p>{customer.billing_address_line1}</p>
              {customer.billing_address_line2 && <p>{customer.billing_address_line2}</p>}
              <p>{customer.billing_city}, {customer.billing_state} {customer.billing_pincode}</p>
              {customer.gstin && <p className="font-bold mt-1">GSTIN: {customer.gstin}</p>}
              {customer.email && <p>EMAIL: {customer.email}</p>}
              {customer.phone && <p>PHONE: {customer.phone}</p>}
            </div>
          </div>
        </div>
        
        {/* Invoice Items with classic table design */}
        <div className="border border-black mb-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black">
                <th className="py-2 px-2 border-r border-black font-bold">SL</th>
                <th className="py-2 px-2 border-r border-black font-bold">DESCRIPTION OF GOODS</th>
                <th className="py-2 px-2 border-r border-black font-bold">HSN/SAC</th>
                <th className="py-2 px-2 border-r border-black font-bold">QTY</th>
                <th className="py-2 px-2 border-r border-black font-bold">UOM</th>
                <th className="py-2 px-2 border-r border-black font-bold">RATE</th>
                <th className="py-2 px-2 border-r border-black font-bold">AMOUNT</th>
                
                {useIGST ? (
                  <>
                    <th className="py-2 px-2 border-r border-black font-bold">IGST %</th>
                    <th className="py-2 px-2 border-r border-black font-bold">IGST AMT</th>
                  </>
                ) : (
                  <>
                    <th className="py-2 px-2 border-r border-black font-bold">CGST %</th>
                    <th className="py-2 px-2 border-r border-black font-bold">CGST AMT</th>
                    <th className="py-2 px-2 border-r border-black font-bold">SGST %</th>
                    <th className="py-2 px-2 border-r border-black font-bold">SGST AMT</th>
                  </>
                )}
                <th className="py-2 px-2 font-bold text-right">TOTAL</th>
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
                  <tr key={item.id || index} className="border-b border-black">
                    <td className="py-1 px-2 border-r border-black text-center">{index + 1}</td>
                    <td className="py-1 px-2 border-r border-black">
                      <div className="font-bold">{item.product_name}</div>
                      {item.description && <div className="text-xs">{item.description}</div>}
                    </td>
                    <td className="py-1 px-2 border-r border-black text-center">{item.hsn_code}</td>
                    <td className="py-1 px-2 border-r border-black text-center">{item.quantity}</td>
                    <td className="py-1 px-2 border-r border-black text-center">{item.unit}</td>
                    <td className="py-1 px-2 border-r border-black text-right">₹{formatAmount(price)}</td>
                    <td className="py-1 px-2 border-r border-black text-right">₹{formatAmount(itemTotal)}</td>
                    
                    {useIGST ? (
                      <>
                        <td className="py-1 px-2 border-r border-black text-center">{gstRate}%</td>
                        <td className="py-1 px-2 border-r border-black text-right">₹{formatAmount(gstAmount)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-1 px-2 border-r border-black text-center">{splitRate}%</td>
                        <td className="py-1 px-2 border-r border-black text-right">₹{formatAmount(splitAmount)}</td>
                        <td className="py-1 px-2 border-r border-black text-center">{splitRate}%</td>
                        <td className="py-1 px-2 border-r border-black text-right">₹{formatAmount(splitAmount)}</td>
                      </>
                    )}
                    <td className="py-1 px-2 text-right font-bold">₹{formatAmount(itemTotal + gstAmount)}</td>
                  </tr>
                );
              })}
              
              {/* Empty rows for classic invoice look */}
              {Array.from({ length: Math.max(0, 3 - (invoice.items?.length || 0)) }).map((_, index) => (
                <tr key={`empty-${index}`} className="border-b border-black">
                  <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                  <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                  {useIGST ? (
                    <>
                      <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                      <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                      <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                      <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                      <td className="py-2 px-2 border-r border-black">&nbsp;</td>
                    </>
                  )}
                  <td className="py-2 px-2">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border border-black p-3">
            <h4 className="font-bold underline mb-2">AMOUNT IN WORDS:</h4>
            <p className="text-xs font-bold uppercase">{amountToWords(roundedTotal)}</p>
          </div>
          
          <div className="border border-black p-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between border-b border-black pb-1">
                <span>SUBTOTAL:</span>
                <span>₹{formatAmount(subtotal)}</span>
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
                  <span>ROUND OFF:</span>
                  <span>₹{formatAmount(roundOffAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-1 font-bold text-sm border-t-2 border-black mt-2">
                <span>GRAND TOTAL:</span>
                <span>₹{formatAmount(roundedTotal)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Terms and Bank Details */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border border-black p-3">
            {invoice.terms_and_conditions && (
              <div className="mb-4">
                <h4 className="font-bold underline mb-2">TERMS & CONDITIONS:</h4>
                <p className="text-xs whitespace-pre-line">{invoice.terms_and_conditions}</p>
              </div>
            )}
            
            {invoice.notes && (
              <div>
                <h4 className="font-bold underline mb-2">NOTES:</h4>
                <p className="text-xs whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
          </div>
          
          <div className="border border-black p-3">
            <h4 className="font-bold underline mb-2">BANK DETAILS:</h4>
            <div className="text-xs space-y-1">
              <p>A/C NAME   : {company.bank_account_name}</p>
              <p>A/C NO     : {company.bank_account_number}</p>
              <p>BANK       : {company.bank_name}</p>
              <p>BRANCH     : {company.bank_branch}</p>
              <p>IFSC CODE  : {company.bank_ifsc_code}</p>
            </div>
          </div>
        </div>
        
        {/* Signature Section */}
        <div className="border border-black p-3 mb-4">
          <div className="flex justify-between">
            <div>
              <p className="text-xs font-bold">RECEIVER'S SIGNATURE</p>
              <div className="h-12"></div>
              <p className="text-xs">_____________________</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold">FOR {company.name.toUpperCase()}</p>
              <div className="h-12"></div>
              <p className="text-xs">_____________________</p>
              <p className="text-xs font-bold">AUTHORISED SIGNATORY</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center border-t-2 border-black pt-2">
          <p className="text-xs font-bold">*** THIS IS A COMPUTER GENERATED INVOICE ***</p>
        </div>
      </div>
    </div>
  );
};

export default ClassicInvoiceView;
