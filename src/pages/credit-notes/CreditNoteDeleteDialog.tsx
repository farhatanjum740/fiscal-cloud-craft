
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CreditNoteDeleteDialogProps {
  id?: string;
  navigate: (path: string) => void;
}

const CreditNoteDeleteDialog: React.FC<CreditNoteDeleteDialogProps> = ({ id, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id) {
      console.error("No credit note ID provided for deletion");
      toast({
        title: "Error",
        description: "No credit note ID found",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      console.log("Deleting credit note with ID:", id);

      // First delete credit note items (due to foreign key constraints)
      const { data: itemsData, error: itemsError } = await supabase
        .from("credit_note_items")
        .delete()
        .eq("credit_note_id", id);

      if (itemsError) {
        console.error("Error deleting credit note items:", itemsError);
        throw itemsError;
      }

      console.log("Successfully deleted credit note items");

      // Then delete the credit note
      const { data, error } = await supabase
        .from("credit_notes")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting credit note:", error);
        throw error;
      }

      console.log("Successfully deleted credit note");

      toast({
        title: "Credit Note Deleted",
        description: "The credit note has been successfully deleted.",
      });

      navigate("/app/invoices");
    } catch (error: any) {
      console.error("Error deleting credit note:", error);
      toast({
        title: "Deletion Failed",
        description: `Failed to delete credit note: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setIsOpen(true)}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              credit note and all related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Credit Note"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CreditNoteDeleteDialog;
