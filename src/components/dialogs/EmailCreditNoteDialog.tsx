
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [subject, setSubject] = useState(`Credit Note ${creditNote?.creditNoteNumber} from ${company?.name}`);
  const [message, setMessage] = useState(`Please find attached credit note ${creditNote?.creditNoteNumber}.`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log the credit note data for debugging
  console.log("EmailCreditNoteDialog - Credit Note data:", creditNote);

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      setError("Recipient email is required");
      return;
    }

    if (!creditNote?.id) {
      setError("Credit Note ID is missing");
      console.error("Credit Note ID is missing in EmailCreditNoteDialog:", creditNote);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Sending credit note email with data:", {
        creditNoteId: creditNote.id,
        recipientEmail,
        subject,
        message
      });

      const { data, error } = await supabase.functions.invoke("send-invoice-email", {
        body: {
          creditNoteId: creditNote.id,
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
            <Input
              id="recipient-email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="customer@example.com"
              required
            />
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

export default EmailCreditNoteDialog;
