
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
import CreditNoteView from "@/components/credit-notes/view/CreditNoteView";
import { Checkbox } from "@/components/ui/checkbox";

interface EmailCreditNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditNote: any;
  company: any;
}

// Improved PDF configuration for text-based rendering
const getPdfOptions = (filename: string) => ({
  filename: filename,
  margin: [3, 3, 3, 3], // Reduced margins to 3mm all around
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { 
    scale: 2, 
    useCORS: true,
    letterRendering: true,
    allowTaint: true,
    logging: false,
    removeContainer: true,
    textRendering: true
  },
  jsPDF: { 
    unit: 'mm', 
    format: 'a4', 
    orientation: 'portrait',
    compress: false, // Disable compression for better text rendering
    precision: 16,
    putOnlyUsedFonts: true,
    floatPrecision: "smart",
    hotfixes: ["px_scaling"]
  },
  enableLinks: true,
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
});

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
  const [invoice, setInvoice] = useState<any>(null);
  
  // Set default values when creditNote data changes
  useEffect(() => {
    if (creditNote && company) {
      // Extract credit note number from the object
      const creditNoteNumber = creditNote.creditNoteNumber || creditNote.credit_note_number;
      
      setSubject(`Credit Note ${creditNoteNumber} from ${company?.name || 'our company'}`);
      setMessage(`Please find attached credit note ${creditNoteNumber}.`);
      
      // Fetch the related invoice
      if (creditNote.invoiceId || creditNote.invoice_id) {
        fetchInvoice(creditNote.invoiceId || creditNote.invoice_id);
      }
      
      // Try to get customer info from the invoice reference
      if (creditNote.invoice?.customer_id) {
        fetchCustomerData(creditNote.invoice.customer_id);
      }
    }
  }, [creditNote, company]);
  
  // Fetch invoice data
  const fetchInvoice = async (invoiceId: string) => {
    if (!invoiceId) return;
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, customer_id')
        .eq('id', invoiceId)
        .single();
      
      if (error) {
        console.error("Error fetching invoice:", error);
        return;
      }
      
      if (data) {
        setInvoice(data);
        
        // If we have a customer ID, fetch their data
        if (data.customer_id) {
          fetchCustomerData(data.customer_id);
        }
      }
    } catch (err) {
      console.error("Error in fetchInvoice:", err);
    }
  };
  
  // Fetch customer data if not available in the creditNote object
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

  // Generate a PDF of the credit note with improved settings
  const generatePDF = async (): Promise<string | null> => {
    if (!creditNotePdfRef.current) return null;

    try {
      // Clone the node to work with
      const clonedNode = creditNotePdfRef.current.cloneNode(true) as HTMLDivElement;
      
      // Add to document body but hide it
      document.body.appendChild(clonedNode);
      clonedNode.style.display = 'block';
      clonedNode.style.position = 'absolute';
      clonedNode.style.left = '-9999px';
      clonedNode.style.width = '210mm';
      clonedNode.style.padding = '3mm'; // Reduced from 5mm to 3mm
      clonedNode.style.backgroundColor = 'white';
      
      // Optimize tables for PDF output - remove borders and adjust spacing
      const tableElements = clonedNode.querySelectorAll('table');
      tableElements.forEach((table) => {
        table.style.width = '100%';
        table.style.tableLayout = 'fixed';
        table.style.maxWidth = '204mm'; // Adjusted for new padding
        table.style.borderCollapse = 'collapse';
        table.style.border = 'none';
        
        const rows = table.querySelectorAll('tr');
        rows.forEach((row) => {
          (row as HTMLElement).style.borderBottom = 'none';
        });
        
        const cells = table.querySelectorAll('th, td');
        cells.forEach((cell) => {
          (cell as HTMLElement).style.padding = '1mm';
          (cell as HTMLElement).style.fontSize = '8pt';
          (cell as HTMLElement).style.wordBreak = 'break-word';
          (cell as HTMLElement).style.border = 'none';
        });
      });
      
      // Configure options for PDF generation
      const options = getPdfOptions(`CreditNote-${creditNote.creditNoteNumber || creditNote.credit_note_number}.pdf`);
      
      try {
        // Force text rendering instead of images
        const pdfBlob = await html2pdf()
          .set(options)
          .from(clonedNode)
          .outputPdf('blob');
        
        // Clean up
        document.body.removeChild(clonedNode);
        
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
        console.error('Error in PDF generation:', err);
        // Clean up on error
        if (document.body.contains(clonedNode)) {
          document.body.removeChild(clonedNode);
        }
        throw err;
      }
      
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

    // Check if creditNote has an ID
    if (!creditNote?.id) {
      console.error("Credit Note ID is missing in EmailCreditNoteDialog:", creditNote);
      setError("Credit Note ID is missing. Please check the credit note data.");
      toast({
        title: "Missing credit note data",
        description: "The credit note information is incomplete. Please try again with a valid credit note.",
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
        description: "Please wait while we send your credit note...",
      });

      console.log("Sending credit note email with data:", {
        creditNoteId: creditNote.id,
        recipientEmail,
        subject,
        message,
        hasPdf: !!pdfBase64
      });

      const { data, error } = await supabase.functions.invoke("send-invoice-email", {
        body: {
          creditNoteId: creditNote.id,
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
          {customer && creditNote && company && invoice && (
            <CreditNoteView 
              creditNote={creditNote} 
              company={company} 
              invoice={invoice}
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
