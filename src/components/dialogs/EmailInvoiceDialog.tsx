
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      } else if (invoice.customerId || invoice.customer_id) {
        // If invoice has customerId but no customer object, fetch customer data
        fetchCustomerEmail(invoice.customerId || invoice.customer_id);
      }
    }
  }, [invoice, company]);
  
  // Fetch customer email if not available in the invoice object
  const fetchCustomerEmail = async (customerId: string) => {
    if (!customerId) return;
    
    try {
      setFetchingCustomer(true);
      console.log("Fetching customer data for ID:", customerId);
      
      const { data, error } = await supabase
        .from('customers')
        .select('email, name')
        .eq('id', customerId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching customer:", error);
        return;
      }
      
      if (data && data.email) {
        console.log("Found customer email:", data.email);
        setRecipientEmail(data.email);
        setAvailableEmails([data.email]);
      } else {
        console.log("No email found for customer:", customerId);
      }
    } catch (err) {
      console.error("Error in fetchCustomerEmail:", err);
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
      console.log("Sending invoice email with data:", {
        invoiceId: invoice.id,
        recipientEmail,
        subject,
        message
      });

      const { data, error } = await supabase.functions.invoke("send-invoice-email", {
        body: {
          invoiceId: invoice.id,
          recipientEmail,
          subject,
          message,
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
    </Dialog>
  );
};

export default EmailInvoiceDialog;
