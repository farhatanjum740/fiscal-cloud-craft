
import React, { useRef } from "react";
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { Printer, Download, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { formatAmount, amountToWords } from '@/lib/utils';

interface BusyCreditNoteViewProps {
  creditNote: any;
  company: any;
  invoice: any;
  customer: any;
  isDownloadable?: boolean;
}

const BusyCreditNoteView: React.FC<BusyCreditNoteViewProps> = ({
  creditNote,
  company,
  invoice,
  customer,
  isDownloadable = true
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return format(new Date(), 'dd/MM/yyyy');
    try {
      const date = new Date(dateString);
      if (isNaN(date as any)) return format(new Date(), 'dd/MM/yyyy');
      return format(date, 'dd/MM/yyyy');
    } catch {
      return format(new Date(), 'dd/MM/yyyy');
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${formatAmount(amount) || '0.00'}`;
  };

  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = async () => {
    if (!printRef.current) return;
    
    try {
      toast({ title: "Generating PDF", description: "Please wait while we prepare your credit note..." });
      
      const options = {
        filename: `Credit-Note-${creditNote.creditNoteNumber || 'draft'}.pdf`,
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

  // Determine if we should show IGST or CGST/SGST based on states
  const companyState = company?.state;
  const customerState = customer?.shipping_state || customer?.billing_state || '';
  const useIGST = companyState !== customerState;

  // Calculate subtotal correctly - sum of all item amounts
  const subtotal = Array.isArray(creditNote.items) 
    ? creditNote.items.reduce((sum: number, item: any) => {
        const price = typeof item.price === 'number' ? item.price : (typeof item.rate === 'number' ? item.rate : 0);
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return sum + (price * quantity);
      }, 0)
    : 0;

  // Calculate GST amounts
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (Array.isArray(creditNote.items)) {
    creditNote.items.forEach((item: any) => {
      const price = typeof item.price === 'number' ? item.price : (typeof item.rate === 'number' ? item.rate : 0);
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      const taxRate = typeof item.tax_percentage === 'number' ? item.tax_percentage : (typeof item.gst_rate === 'number' ? item.gst_rate : 0);
      
      const itemTotal = price * quantity;
      const taxAmount = (itemTotal * taxRate) / 100;
      
      if (useIGST) {
        igst += taxAmount;
      } else {
        cgst += taxAmount / 2;
        sgst += taxAmount / 2;
      }
    });
  }

  // Calculate total
  const totalAmount = subtotal + cgst + sgst + igst;
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
          <Button variant="default" size="sm" onClick={handleDownload} title="Download Credit Note">
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
        {/* Busy-style Header with gradient background - exactly matching invoice */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-t-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {company?.logo && (
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`} 
                  className="h-14 w-auto object-contain bg-white p-1 rounded" 
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{company?.name}</h2>
                <p className="text-sm opacity-90">{company?.address_line1 || company?.address}</p>
                {company?.address_line2 && <p className="text-sm opacity-90">{company.address_line2}</p>}
                <p className="text-sm opacity-90">{company?.city}, {company?.state} - {company?.pincode}</p>
              </div>
            </div>
            
            <div className="text-right">
              <h1 className="text-2xl font-bold bg-white text-blue-800 px-4 py-2 rounded">CREDIT NOTE</h1>
              <p className="text-sm mt-2 opacity-90">GST Credit Note</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-blue-400">
            <div>
              <p className="text-sm font-semibold">GSTIN: {company?.gstin}</p>
              {company?.contact_number && (
                <p className="text-sm flex items-center mt-1">
                  <Phone className="h-3 w-3 mr-1" /> {company.contact_number}
                </p>
              )}
            </div>
            <div className="text-right">
              {company?.email_id && (
                <p className="text-sm flex items-center justify-end">
                  <Mail className="h-3 w-3 mr-1" /> {company.email_id}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Credit Note and Customer Details in Cards - exactly matching invoice */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-bold text-blue-800 mb-2">Credit Note Details</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">Credit Note No:</span> {creditNote.creditNoteNumber || 'DRAFT'}</p>
              <p><span className="font-semibold">Date:</span> {formatDate(creditNote.creditNoteDate)}</p>
              <p><span className="font-semibold">Reference Invoice:</span> {invoice?.invoice_number || 'N/A'}</p>
              {invoice?.invoice_date && (
                <p><span className="font-semibold">Invoice Date:</span> {formatDate(invoice.invoice_date)}</p>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">Credit To</h3>
            <div className="text-sm">
              <p className="font-semibold text-gray-800">{customer?.name || 'Customer Name'}</p>
              <p className="text-gray-600">{customer?.billing_address_line1 || customer?.address}</p>
              {customer?.billing_address_line2 && <p className="text-gray-600">{customer.billing_address_line2}</p>}
              <p className="text-gray-600">{customer?.billing_city || customer?.city}, {customer?.billing_state || customer?.state} {customer?.billing_pincode || customer?.pincode}</p>
              {customer?.gstin && <p className="text-sm font-semibold mt-1">GSTIN: {customer.gstin}</p>}
              {customer?.email && <p className="text-sm">Email: {customer.email}</p>}
              {customer?.phone && <p className="text-sm">Phone: {customer.phone}</p>}
            </div>
          </div>
        </div>
        
        {/* Credit Note Items with modern table design - exactly matching invoice */}
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
              {Array.isArray(creditNote.items) && creditNote.items.map((item: any, index: number) => {
                const price = typeof item.price === 'number' ? item.price : (typeof item.rate === 'number' ? item.rate : 0);
                const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                const taxRate = typeof item.tax_percentage === 'number' ? item.tax_percentage : (typeof item.gst_rate === 'number' ? item.gst_rate : 0);
                
                const itemTotal = price * quantity;
                const taxAmount = (itemTotal * taxRate) / 100;
                const splitRate = taxRate / 2;
                const splitAmount = taxAmount / 2;
                
                return (
                  <tr key={item.id || index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="py-2 px-3 border-r border-gray-200 text-center font-medium">{index + 1}</td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      <div className="font-medium text-gray-800">{item.product_name || item.description}</div>
                      {item.description && item.product_name && <div className="text-xs text-gray-600 mt-1">{item.description}</div>}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200 text-center">{item.hsn_code}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-center font-medium">{item.quantity}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-right">₹{formatAmount(price)}</td>
                    <td className="py-2 px-3 border-r border-gray-200 text-right font-medium">₹{formatAmount(itemTotal)}</td>
                    
                    {useIGST ? (
                      <>
                        <td className="py-2 px-3 border-r border-gray-200 text-center">{taxRate}%</td>
                        <td className="py-2 px-3 border-r border-gray-200 text-right">₹{formatAmount(taxAmount)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-3 border-r border-gray-200 text-center">{splitRate}%</td>
                        <td className="py-2 px-3 border-r border-gray-200 text-right">₹{formatAmount(splitAmount)}</td>
                        <td className="py-2 px-3 border-r border-gray-200 text-center">{splitRate}%</td>
                        <td className="py-2 px-3 border-r border-gray-200 text-right">₹{formatAmount(splitAmount)}</td>
                      </>
                    )}
                    <td className="py-2 px-3 text-right font-bold text-blue-800">₹{formatAmount(itemTotal + taxAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Summary Section - exactly matching invoice */}
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
                <span className="text-blue-800">TOTAL CREDIT:</span>
                <span className="text-blue-800">₹{formatAmount(roundedTotal)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reason and Notes - exactly matching invoice layout */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            {creditNote.reason && (
              <div className="mb-3">
                <h4 className="font-bold text-gray-800 mb-2">Reason for Credit Note</h4>
                <p className="text-xs whitespace-pre-line text-gray-600">{creditNote.reason}</p>
              </div>
            )}
            
            {creditNote.notes && (
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Notes</h4>
                <p className="text-xs whitespace-pre-line text-gray-600">{creditNote.notes}</p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">Bank Details</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-semibold">Account Name:</span> {company?.bank_account_name}</p>
              <p><span className="font-semibold">Account No:</span> {company?.bank_account_number}</p>
              <p><span className="font-semibold">Bank:</span> {company?.bank_name}</p>
              <p><span className="font-semibold">Branch:</span> {company?.bank_branch}</p>
              <p><span className="font-semibold">IFSC:</span> {company?.bank_ifsc_code}</p>
            </div>
          </div>
        </div>
        
        {/* Footer - exactly matching invoice */}
        <div className="text-center border-t-2 border-blue-800 pt-3">
          <p className="text-xs text-gray-600">This is a computer generated credit note and does not require physical signature.</p>
          <p className="text-xs text-blue-800 font-semibold mt-1">Powered by Advanced Accounting System</p>
        </div>
      </div>
    </div>
  );
};

export default BusyCreditNoteView;
