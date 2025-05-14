
import React, { useState } from 'react';
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CreditNoteDeleteDialogProps {
  id?: string;
  navigate: (path: string) => void;
}

const CreditNoteDeleteDialog: React.FC<CreditNoteDeleteDialogProps> = ({ id, navigate }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteCreditNote = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      console.log("Starting to delete credit note with ID:", id);
      
      // First delete the credit note items
      const { error: itemsError } = await supabase
        .from('credit_note_items')
        .delete()
        .eq('credit_note_id', id);
        
      if (itemsError) {
        console.error("Error deleting credit note items:", itemsError);
        throw itemsError;
      }
      
      console.log("Successfully deleted credit note items, now deleting credit note");
      
      // Then delete the credit note
      const { error } = await supabase
        .from('credit_notes')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting credit note:", error);
        throw error;
      }
      
      console.log("Successfully deleted credit note");
      
      toast({
        title: "Credit note deleted",
        description: "The credit note has been successfully deleted."
      });
      
      // Navigate away after a short delay to ensure the toast is seen
      setTimeout(() => {
        navigate("/app/invoices");
      }, 500);
    } catch (error: any) {
      console.error("Error deleting credit note:", error);
      toast({
        title: "Error",
        description: `Failed to delete credit note: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the credit note
            and all related data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteCreditNote}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreditNoteDeleteDialog;
