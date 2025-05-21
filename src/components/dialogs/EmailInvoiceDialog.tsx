
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2pdf from 'html2pdf.js';
import InvoiceViewComponent from "@/components/invoices/InvoiceView";

interface EmailInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
  company: any;
}

const EmailInvoiceDialog: React.FC<EmailInvoiceDialogProps> = ({
  open,
  onOpenChange,
  invoice,
  company,
}) => {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [availableEmails, setAvailableEmails] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [includePdf, setIncludePdf] = useState(true);
  const invoicePdfRef = useRef<HTMLDivElement>(null);
  
  // Set default values when invoice data changes
  useEffect(() => {
    if (invoice) {
      // Extract invoice number from the invoice object
      const invoiceNumber = invoice.invoiceNumber || invoice.invoice_number;
      
      setSubject(`Invoice ${invoiceNumber} from ${company?.name || 'our company'}`);
      setMessage(`Please find attached invoice ${invoiceNumber}.`);
      
      // If invoice has a customer with an email, use it
      if (invoice.customer?.email) {
        setRecipientEmail(invoice.customer.email);
        setAvailableEmails([invoice.customer.email]);
        setCustomer(invoice.customer);
      } else if (invoice.customerId || invoice.customer_id) {
        // If invoice has customerId but no customer object, fetch customer data
        fetchCustomerData(invoice.customerId || invoice.customer_id);
      }
    }
  }, [invoice, company]);
  
  // Fetch customer data if not available in the invoice object
  const fetchCustomerData = async (customerId: string) => {
    if (!customerId) return;
    
    try {
      setFetchingCustomer(true);
      console.log("Fetching customer data for ID:", customerId);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error) {
        console.error("Error fetching customer:", error);
        return;
      }
      
      if (data) {
        console.log("Found customer data:", data);
        setCustomer(data);
        
        if (data.email) {
          console.log("Found customer email:", data.email);
          setRecipientEmail(data.email);
          setAvailableEmails([data.email]);
        }
      } else {
        console.log("No customer found for ID:", customerId);
      }
    } catch (err) {
      console.error("Error in fetchCustomerData:", err);
    } finally {
      setFetchingCustomer(false);
    }
  };

  // Log debug information about the invoice object
  useEffect(() => {
    if (invoice && open) {
      console.log("EmailInvoiceDialog - Invoice data:", invoice);
      console.log("Invoice ID:", invoice?.id);
      console.log("Invoice number:", invoice?.invoiceNumber || invoice?.invoice_number);
      console.log("Invoice customer_id:", invoice?.customerId || invoice?.customer_id);
    }
  }, [invoice, open]);

  // Generate a PDF of the invoice
  const generatePDF = async (): Promise<string | null> => {
    if (!invoicePdfRef.current) return null;

    try {
      // Create a clone of the invoice view for PDF generation
      const pdfContainer = document.createElement('div');
      pdfContainer.innerHTML = invoicePdfRef.current.innerHTML;
      document.body.appendChild(pdfContainer);
      
      // Configure html2pdf options
      const options = {
        margin: 10,
        filename: `Invoice-${invoice.invoiceNumber || invoice.invoice_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate PDF using html2pdf
      const pdfBlob = await html2pdf()
        .from(pdfContainer)
        .set(options)
        .outputPdf('blob');
      
      // Convert blob to base64
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Extract just the base64 data part (remove data:application/pdf;base64, prefix)
          const base64Content = base64data.split(',')[1];
          resolve(base64Content);
        };
        reader.readAsDataURL(pdfBlob);
      });
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      return null;
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      setError("Recipient email is required");
      return;
    }

    // Check if invoice has an ID
    if (!invoice?.id) {
      console.error("Invoice ID is missing in EmailInvoiceDialog:", invoice);
      setError("Invoice ID is missing. Please check the invoice data.");
      toast({
        title: "Missing invoice data",
        description: "The invoice information is incomplete. Please try again with a valid invoice.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let pdfBase64 = null;
      
      // Only generate PDF if includePdf is true
      if (includePdf) {
        toast({
          title: "Generating PDF",
          description: "Preparing PDF attachment...",
        });
        
        pdfBase64 = await generatePDF();
        if (!pdfBase64) {
          console.warn("Failed to generate PDF attachment");
          toast({
            title: "Warning",
            description: "Could not generate PDF attachment. Email will be sent without it.",
          });
        }
      }
      
      toast({
        title: "Sending email",
        description: "Please wait while we send your invoice...",
      });

      console.log("Sending invoice email with data:", {
        invoiceId: invoice.id,
        recipientEmail,
        subject,
        message,
        hasPdf: !!pdfBase64
      });

      const { data, error } = await supabase.functions.invoke("send-invoice-email", {
        body: {
          invoiceId: invoice.id,
          recipientEmail,
          subject,
          message,
          pdfBase64: pdfBase64
        },
      });

      if (error) {
        console.error("Function invoke error:", error);
        throw new Error(error.message || "Failed to send email");
      }
      
      if (!data || data.error) {
        console.error("Function returned error:", data?.error);
        throw new Error(data?.error || "Failed to send email");
      }
      
      console.log("Email sent successfully:", data);
      
      toast({
        title: "Email sent successfully",
        description: `Invoice has been sent to ${recipientEmail}`,
      });
      
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error sending invoice email:", err);
      setError(err.message || "Failed to send email");
      toast({
        title: "Failed to send email",
        description: err.message || "An error occurred while sending the email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Email Invoice</DialogTitle>
          <DialogDescription>
            Send this invoice as an email with PDF attachment
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipient-email">Recipient Email *</Label>
            {availableEmails.length > 0 ? (
              <Select 
                defaultValue={recipientEmail} 
                onValueChange={setRecipientEmail}
                disabled={fetchingCustomer}
              >
                <SelectTrigger id="recipient-email">
                  <SelectValue placeholder={fetchingCustomer ? "Loading customer email..." : "Select customer email"} />
                </SelectTrigger>
                <SelectContent>
                  {availableEmails.map((email) => (
                    <SelectItem key={email} value={email}>
                      {email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder={fetchingCustomer ? "Loading customer email..." : "customer@example.com"}
                required
                disabled={fetchingCustomer}
              />
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include-pdf"
              checked={includePdf}
              onChange={(e) => setIncludePdf(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="include-pdf" className="text-sm font-normal">
              Include invoice as PDF attachment
            </Label>
          </div>

          {error && (
            <div className="text-sm font-medium text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmail}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Hidden invoice component for PDF generation */}
      <div className="hidden">
        <div ref={invoicePdfRef}>
          {customer && invoice && company && (
            <InvoiceViewComponent 
              invoice={invoice} 
              company={company} 
              customer={customer}
              isDownloadable={false}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default EmailInvoiceDialog;
