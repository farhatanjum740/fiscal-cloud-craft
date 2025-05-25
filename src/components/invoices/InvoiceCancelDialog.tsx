
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface InvoiceCancelDialogProps {
  id?: string;
  status?: string;
  navigate: (path: string) => void;
}

const cancellationReasons = [
  { value: "duplicate", label: "Duplicate Invoice" },
  { value: "error", label: "Invoice Error" },
  { value: "customer_request", label: "Customer Request" },
  { value: "business_closure", label: "Business Closure" },
  { value: "payment_issue", label: "Payment Issue" },
  { value: "other", label: "Other" }
];

const InvoiceCancelDialog: React.FC<InvoiceCancelDialogProps> = ({ 
  id, 
  status, 
  navigate 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const { user } = useAuth();

  // Don't show cancel button for already cancelled invoices
  if (status === "cancelled") {
    return null;
  }

  const handleCancel = async () => {
    if (!id) {
      console.error("No invoice ID provided for cancellation");
      toast({
        title: "Error",
        description: "No invoice ID found",
        variant: "destructive",
      });
      return;
    }

    if (!cancellationReason) {
      toast({
        title: "Cancellation Reason Required",
        description: "Please select a reason for cancellation",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCancelling(true);
      console.log("Cancelling invoice with ID:", id);

      // Update invoice status to cancelled
      const { error } = await supabase
        .from("invoices")
        .update({
          status: "cancelled",
          cancellation_reason: cancellationReason,
          cancelled_at: new Date().toISOString(),
          cancelled_by: user?.id
        })
        .eq("id", id);

      if (error) {
        console.error("Error cancelling invoice:", error);
        throw new Error(`Failed to cancel invoice: ${error.message}`);
      }

      console.log("Successfully cancelled invoice");

      toast({
        title: "Invoice Cancelled",
        description: "The invoice has been successfully cancelled.",
      });

      // Close the dialog and navigate away
      setIsOpen(false);
      navigate("/app/invoices");
    } catch (error: any) {
      console.error("Error in cancellation process:", error);
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setIsOpen(true)}
        disabled={isCancelling}
      >
        <Ban className="h-4 w-4 mr-2" />
        Cancel Invoice
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the invoice as cancelled. The invoice will remain in your records for audit purposes but cannot be used for transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Reason for Cancellation *
            </label>
            <Select value={cancellationReason} onValueChange={setCancellationReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {cancellationReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancel();
              }}
              disabled={isCancelling || !cancellationReason}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? "Cancelling..." : "Cancel Invoice"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InvoiceCancelDialog;
