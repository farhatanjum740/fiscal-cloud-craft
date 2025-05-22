
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import html2pdf from 'html2pdf.js';
import { Checkbox } from "@/components/ui/checkbox";
import CreditNoteViewComponent from "@/components/credit-notes/view";

interface EmailCreditNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditNote: any;
  company: any;
}

const EmailCreditNoteDialog: React.FC<EmailCreditNoteDialogProps> = ({
  open,
  onOpenChange,
  creditNote,
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
  const creditNotePdfRef = useRef<HTMLDivElement>(null);

  // Log the credit note data for debugging
  useEffect(() => {
    if (creditNote && open) {
      // Create a safe copy to ensure we don't lose any data
      const safeCreditNote = { ...creditNote };
      
      console.log("EmailCreditNoteDialog - Credit Note data:", safeCreditNote);
      console.log("Credit Note ID:", safeCreditNote.id);
      console.log("Credit Note Number:", safeCreditNote.creditNoteNumber || safeCreditNote.credit_note_number);
      console.log("Credit Note Invoice ID:", safeCreditNote.invoiceId || safeCreditNote.invoice_id);
      
      // Ensure the ID is preserved in our local state
      if (!safeCreditNote.id) {
        console.error("Credit note is missing ID in EmailCreditNoteDialog");
      }
      
      // Set default subject and message
      setSubject(`Credit Note ${safeCreditNote.creditNoteNumber || safeCreditNote.credit_note_number} from ${company?.name || 'our company'}`);
      setMessage(`Please find attached credit note ${safeCreditNote.creditNoteNumber || safeCreditNote.credit_note_number}.`);
      
      // Get invoice to fetch customer data
      const invoiceId = safeCreditNote.invoiceId || safeCreditNote.invoice_id;
      if (invoiceId) {
        fetchInvoiceAndCustomer(invoiceId);
      }
    }
  }, [creditNote, company, open]);

  const fetchInvoiceAndCustomer = async (invoiceId: string) => {
    try {
      setFetchingCustomer(true);
      console.log("Fetching invoice data for ID:", invoiceId);
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, customer_id')
        .eq('id', invoiceId)
        .single();
        
      if (invoiceError) {
        console.error("Error fetching invoice:", invoiceError);
        return;
      }
      
      if (!invoice || !invoice.customer_id) {
        console.error("No customer ID found in invoice:", invoice);
        return;
      }
      
      console.log("Found invoice with customer ID:", invoice.customer_id);
      
      // Now fetch the customer data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', invoice.customer_id)
        .single();
        
      if (customerError) {
        console.error("Error fetching customer:", customerError);
        return;
      }
      
      if (customerData) {
        console.log("Found customer data:", customerData);
        setCustomer(customerData);
        
        if (customerData.email) {
          console.log("Setting customer email:", customerData.email);
          setRecipientEmail(customerData.email);
          setAvailableEmails([customerData.email]);
        }
      }
    } catch (err) {
      console.error("Error in fetchInvoiceAndCustomer:", err);
    } finally {
      setFetchingCustomer(false);
    }
  };

  // Generate a PDF of the credit note with improved settings for better text rendering
  const generatePDF = async (): Promise<string | null> => {
    if (!creditNotePdfRef.current) return null;

    try {
      // Clone the node to work with
      const pdfContainer = creditNotePdfRef.current.cloneNode(true) as HTMLElement;
      
      // Adjust the styling for better PDF generation
      pdfContainer.style.width = '210mm';
      pdfContainer.style.padding = '10mm';
      pdfContainer.style.backgroundColor = 'white';
      
      // Configure html2pdf options for better text rendering and content fitting
      const options = {
        filename: `Credit-Note-${creditNote.creditNoteNumber || creditNote.credit_note_number}.pdf`,
        margin: [5, 5, 5, 5], // 5mm margins as requested
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          logging: false, 
          removeContainer: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: false, // Disable compression for better text rendering
          precision: 16,
          putOnlyUsedFonts: true,
          floatPrecision: "smart"
        },
        enableLinks: true,
        pagebreak: { mode: 'avoid-all' }
      };

      // Generate PDF using html2pdf with improved settings
      const pdfBlob = await html2pdf()
        .from(pdfContainer)
        .set(options)
        .outputPdf('blob');
      
      // Convert blob to base64
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Extract just the base64 data part
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

    // Extra safety checks for credit note ID
    if (!creditNote) {
      console.error("Missing credit note object");
      setError("Credit note data is missing");
      return;
    }
    
    // Get the credit note ID, with additional safety checks
    const creditNoteId = creditNote.id;
    
    console.log("About to send email for credit note:", creditNote);
    console.log("Credit note ID being used:", creditNoteId);
    
    if (!creditNoteId) {
      console.error("Credit Note ID is missing in EmailCreditNoteDialog:", creditNote);
      console.log("Entire credit note object:", JSON.stringify(creditNote, null, 2));
      setError("Credit Note ID is missing");
      toast({
        title: "Missing credit note data",
        description: "The credit note information is incomplete. Please try again with a valid credit note.",
        variant: "destructive"
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
        description: "Please wait while we send your credit note...",
      });
      
      // Ensure we're explicitly sending the credit note ID as a string
      const safeId = String(creditNoteId);

      console.log("Sending credit note email with data:", {
        creditNoteId: safeId,
        recipientEmail,
        subject,
        message,
        hasPdf: !!pdfBase64
      });

      const { data, error } = await supabase.functions.invoke("send-invoice-email", {
        body: {
          creditNoteId: safeId,
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
        description: `Credit note has been sent to ${recipientEmail}`,
      });
      
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error sending credit note email:", err);
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
          <DialogTitle>Email Credit Note</DialogTitle>
          <DialogDescription>
            Send this credit note as an email with PDF attachment
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
            <Checkbox
              id="include-pdf"
              checked={includePdf}
              onCheckedChange={(checked) => setIncludePdf(checked as boolean)}
            />
            <Label htmlFor="include-pdf" className="text-sm font-normal cursor-pointer">
              Include credit note as PDF attachment
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
      
      {/* Hidden credit note component for PDF generation */}
      <div className="hidden">
        <div ref={creditNotePdfRef}>
          {customer && creditNote && company && (
            <CreditNoteViewComponent 
              creditNote={creditNote} 
              company={company} 
              invoice={creditNote.invoice || creditNote.invoices}
              customer={customer}
              isDownloadable={false}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default EmailCreditNoteDialog;
