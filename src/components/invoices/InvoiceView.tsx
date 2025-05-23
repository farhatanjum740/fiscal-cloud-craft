import React, { useRef, useState, useEffect } from 'react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { Printer, Download, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency, formatAmount, amountToWords } from '@/lib/utils';
import EmailInvoiceDialog from '@/components/dialogs/EmailInvoiceDialog';

interface InvoiceViewProps {
  invoice: any;
  company: any;
  customer: any;
  isDownloadable?: boolean;
}

// Improved PDF configuration that prioritizes text rendering
const getPdfOptions = (filename: string) => ({
  filename: filename,
  margin: 10,
  image: { type: 'jpeg', quality: 0.95 },
  html2canvas: { 
    scale: 2, 
    useCORS: true,
    logging: false,
    removeContainer: true
  },
  jsPDF: { 
    unit: 'mm', 
    format: 'a4', 
    orientation: 'portrait',
    compress: false,
    putOnlyUsedFonts: true,
    floatPrecision: 16
  }
});

export const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice, company, customer, isDownloadable = true }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  
  // Log data to console for debugging
  useEffect(() => {
    console.log("Invoice View - Data received:", {
      invoice,
      company,
      customer
    });
    
    if (invoice) {
      // Log specific invoice properties including ID
      console.log("Invoice View - Invoice Details:", {
        id: invoice.id,
        number: invoice.invoiceNumber,
        date: invoice.invoiceDate,
        subtotal: invoice.subtotal,
        cgst: invoice.cgst,
        sgst: invoice.sgst,
        igst: invoice.igst,
        totalAmount: invoice.total_amount
      });
    }
  }, [invoice, company, customer]);
  
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
      
      const options = getPdfOptions(`Invoice-${invoice.invoiceNumber}.pdf`);
      
      html2pdf()
        .from(printRef.current)
        .set(options)
        .save()
        .then(() => {
          toast({ title: "Download complete", description: "Invoice has been downloaded as PDF." });
        })
        .catch((error) => {
          console.error('Error in PDF generation:', error);
          toast({ 
            title: "Download failed", 
            description: "Failed to generate PDF. Please try again.", 
            variant: "destructive" 
          });
        });
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      toast({ 
        title: "Download failed", 
        description: "Failed to generate PDF. Please try again.", 
        variant: "destructive" 
      });
    }
  };
  
  const handleEmail = () => {
    console.log("Opening email dialog with invoice:", invoice);
    setEmailDialogOpen(true);
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
      const gstRate = typeof item.gstRate === 'number' ? item.gstRate : 0;
      
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
          <Button variant="secondary" size="sm" onClick={handleEmail} title="Email Invoice">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      )}
      
      <div 
        ref={printRef} 
        className="bg-white p-8 max-w-4xl mx-auto print:shadow-none print:border-none"
        style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box', margin: '0 auto' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg font-bold text-gray-800">INVOICE</h1>
            <p className="text-xs text-gray-500"># {invoice.invoiceNumber}</p>
            <p className="text-xs text-gray-500 mt-1">Date: {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'dd/MM/yyyy') : ''}</p>
            {invoice.dueDate && (
              <p className="text-xs text-gray-500">Due Date: {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</p>
            )}
          </div>
          
          <div className="text-right">
            <div className="flex items-start gap-3 justify-end">
              {company.logo && (
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`} 
                  className="h-10 w-auto object-contain" 
                />
              )}
              <div>
                <h2 className="text-base font-bold text-gray-800">{company.name}</h2>
                <p className="text-xs text-gray-600">{company.address_line1}</p>
                {company.address_line2 && <p className="text-xs text-gray-600">{company.address_line2}</p>}
                <p className="text-xs text-gray-600">{company.city}, {company.state} - {company.pincode}</p>
                <p className="text-xs text-gray-600">GSTIN: {company.gstin}</p>
                {company.contact_number && (
                  <p className="text-xs text-gray-600 flex items-center justify-end">
                    <Phone className="h-3 w-3 mr-1" /> {company.contact_number}
                  </p>
                )}
                {company.email_id && (
                  <p className="text-xs text-gray-600 flex items-center justify-end">
                    <Mail className="h-3 w-3 mr-1" /> {company.email_id}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-3" />
        
        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <h3 className="font-semibold text-xs text-gray-800 mb-1">Bill To:</h3>
            <p className="font-medium text-xs">{customer.name}</p>
            <p className="text-xs">{customer.billing_address_line1}</p>
            {customer.billing_address_line2 && <p className="text-xs">{customer.billing_address_line2}</p>}
            <p className="text-xs">{customer.billing_city}, {customer.billing_state} {customer.billing_pincode}</p>
            {customer.gstin && <p className="text-xs">GSTIN: {customer.gstin}</p>}
            {customer.email && <p className="text-xs">Email: {customer.email}</p>}
            {customer.phone && <p className="text-xs">Phone: {customer.phone}</p>}
          </div>
          
          {(customer.shipping_address_line1 || customer.shipping_city) && (
            <div>
              <h3 className="font-semibold text-xs text-gray-800 mb-1">Ship To:</h3>
              <p className="font-medium text-xs">{customer.name}</p>
              <p className="text-xs">{customer.shipping_address_line1 || customer.billing_address_line1}</p>
              {customer.shipping_address_line2 && <p className="text-xs">{customer.shipping_address_line2}</p>}
              <p className="text-xs">
                {customer.shipping_city || customer.billing_city}, 
                {customer.shipping_state || customer.billing_state} 
                {customer.shipping_pincode || customer.billing_pincode}
              </p>
            </div>
          )}
        </div>
        
        {/* Invoice Items - Using fixed table layout and controlling column widths */}
        <div className="w-full overflow-hidden">
          <table className="w-full border-collapse mb-3 text-xs" style={{ tableLayout: 'fixed', width: '100%', maxWidth: '100%' }}>
            <thead>
              <tr className="bg-gray-100">
                <th className="py-1 px-1 border font-semibold" style={{ width: '5%' }}>No</th>
                <th className="py-1 px-1 border font-semibold" style={{ width: '25%' }}>Item</th>
                <th className="py-1 px-1 border font-semibold" style={{ width: '10%' }}>HSN/SAC</th>
                <th className="py-1 px-1 border font-semibold" style={{ width: '7%' }}>Qty</th>
                <th className="py-1 px-1 border font-semibold" style={{ width: '8%' }}>Unit</th>
                <th className="py-1 px-1 border font-semibold" style={{ width: '10%' }}>Rate</th>
                <th className="py-1 px-1 border font-semibold" style={{ width: '10%' }}>Amount</th>
                
                {useIGST ? (
                  <>
                    <th className="py-1 px-1 border font-semibold" style={{ width: '7%' }}>IGST %</th>
                    <th className="py-1 px-1 border font-semibold" style={{ width: '8%' }}>IGST</th>
                  </>
                ) : (
                  <>
                    <th className="py-1 px-1 border font-semibold" style={{ width: '5%' }}>CGST %</th>
                    <th className="py-1 px-1 border font-semibold" style={{ width: '5%' }}>CGST</th>
                    <th className="py-1 px-1 border font-semibold" style={{ width: '5%' }}>SGST %</th>
                    <th className="py-1 px-1 border font-semibold" style={{ width: '5%' }}>SGST</th>
                  </>
                )}
                <th className="py-1 px-1 border font-semibold text-right" style={{ width: '10%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(invoice.items) && invoice.items.map((item: any, index: number) => {
                // Ensure we're working with numbers
                const price = typeof item.price === 'number' ? item.price : 0;
                const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                const gstRate = typeof item.gstRate === 'number' ? item.gstRate : 0;
                
                const itemTotal = price * quantity;
                const gstAmount = (itemTotal * gstRate) / 100;
                // Calculate split rates for CGST/SGST (half of GST rate for each)
                const splitRate = gstRate / 2;
                const splitAmount = gstAmount / 2;
                
                return (
                  <tr key={item.id || index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-1 px-1 border text-xs">{index + 1}</td>
                    <td className="py-1 px-1 border text-xs">
                      <div className="font-medium">{item.productName}</div>
                      {item.description && <div className="text-xs text-gray-600">{item.description}</div>}
                    </td>
                    <td className="py-1 px-1 border text-xs">{item.hsnCode}</td>
                    <td className="py-1 px-1 border text-xs">{item.quantity}</td>
                    <td className="py-1 px-1 border text-xs">{item.unit}</td>
                    <td className="py-1 px-1 border text-xs">₹{formatAmount(price)}</td>
                    <td className="py-1 px-1 border text-xs">₹{formatAmount(itemTotal)}</td>
                    
                    {useIGST ? (
                      <>
                        <td className="py-1 px-1 border text-xs">{gstRate}%</td>
                        <td className="py-1 px-1 border text-xs">₹{formatAmount(gstAmount)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-1 px-1 border text-xs">{splitRate}%</td>
                        <td className="py-1 px-1 border text-xs">₹{formatAmount(splitAmount)}</td>
                        <td className="py-1 px-1 border text-xs">{splitRate}%</td>
                        <td className="py-1 px-1 border text-xs">₹{formatAmount(splitAmount)}</td>
                      </>
                    )}
                    <td className="py-1 px-1 border text-xs text-right">₹{formatAmount(itemTotal + gstAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Summary */}
        <div className="flex justify-end mb-3">
          <div className="w-64">
            <div className="flex justify-between py-1 text-xs">
              <span>Subtotal:</span>
              <span>₹{formatAmount(subtotal)}</span>
            </div>
            
            {!useIGST && (cgst > 0 || sgst > 0) && (
              <>
                <div className="flex justify-between py-1 text-xs">
                  <span>CGST:</span>
                  <span>₹{formatAmount(cgst)}</span>
                </div>
                <div className="flex justify-between py-1 text-xs">
                  <span>SGST:</span>
                  <span>₹{formatAmount(sgst)}</span>
                </div>
              </>
            )}
            
            {useIGST && igst > 0 && (
              <div className="flex justify-between py-1 text-xs">
                <span>IGST:</span>
                <span>₹{formatAmount(igst)}</span>
              </div>
            )}
            
            {roundOffAmount !== 0 && (
              <div className="flex justify-between py-1 text-xs">
                <span>Round off:</span>
                <span>₹{formatAmount(roundOffAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-1 font-bold border-t border-gray-300 mt-2 text-xs">
              <span>Total:</span>
              <span>₹{formatAmount(roundedTotal)}</span>
            </div>
          </div>
        </div>
        
        {/* Amount in words */}
        <div className="mb-3 border p-2 bg-gray-50 rounded text-xs">
          <p><span className="font-medium">Amount in words:</span> {amountToWords(roundedTotal)}</p>
        </div>
        
        {/* Notes and Terms */}
        <div className="grid grid-cols-1 gap-2 mb-3">
          {invoice.termsAndConditions && (
            <div>
              <h4 className="font-semibold mb-1 text-xs">Terms & Conditions:</h4>
              <p className="text-xs whitespace-pre-line">{invoice.termsAndConditions}</p>
            </div>
          )}
          
          {invoice.notes && (
            <div>
              <h4 className="font-semibold mb-1 text-xs">Notes:</h4>
              <p className="text-xs whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>
        
        {/* Bank Details */}
        <div className="border-t pt-2 mt-2">
          <h4 className="font-semibold mb-1 text-xs">Bank Details:</h4>
          <p className="text-xs">
            {company.bank_account_name} ({company.bank_account_number}) | {company.bank_name}, {company.bank_branch} | IFSC: {company.bank_ifsc_code}
          </p>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-4 text-xs text-gray-500">
          <p>This is a computer generated invoice.</p>
        </div>
      </div>

      {isDownloadable && (
        <EmailInvoiceDialog 
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          invoice={invoice}
          company={company}
        />
      )}
    </div>
  );
};

export default InvoiceView;
