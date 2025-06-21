
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuditTrail } from './useAuditTrail';

interface SoftDeleteOptions {
  table: string;
  idField?: string;
  softDeleteField?: string;
  reasonField?: string;
}

export const useSoftDelete = (options: SoftDeleteOptions) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { logAction } = useAuditTrail();
  
  const {
    table,
    idField = 'id',
    softDeleteField = 'cancelled_at',
    reasonField = 'cancellation_reason'
  } = options;

  const softDelete = useCallback(async (
    id: string,
    reason?: string,
    additionalData?: Record<string, any>
  ) => {
    setIsDeleting(true);
    
    try {
      // Get current record for audit trail
      const { data: currentRecord, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq(idField, id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Prepare update data
      const updateData: Record<string, any> = {
        [softDeleteField]: new Date().toISOString(),
        ...(reason && reasonField ? { [reasonField]: reason } : {}),
        ...additionalData
      };

      // Perform soft delete
      const { error: updateError } = await supabase
        .from(table)
        .update(updateData)
        .eq(idField, id);

      if (updateError) {
        throw updateError;
      }

      // Log the action
      await logAction(table, id, 'DELETE', currentRecord, updateData);

      toast({
        title: "Success",
        description: `${table.slice(0, -1)} has been cancelled successfully.`,
      });

      return true;
    } catch (error) {
      console.error(`Error soft deleting ${table}:`, error);
      toast({
        title: "Error",
        description: `Failed to cancel ${table.slice(0, -1)}. Please try again.`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [table, idField, softDeleteField, reasonField, logAction]);

  const restore = useCallback(async (id: string) => {
    setIsDeleting(true);
    
    try {
      // Get current record for audit trail
      const { data: currentRecord, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq(idField, id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Prepare update data
      const updateData: Record<string, any> = {
        [softDeleteField]: null,
        ...(reasonField ? { [reasonField]: null } : {})
      };

      // Restore record
      const { error: updateError } = await supabase
        .from(table)
        .update(updateData)
        .eq(idField, id);

      if (updateError) {
        throw updateError;
      }

      // Log the action
      await logAction(table, id, 'UPDATE', currentRecord, updateData);

      toast({
        title: "Success",
        description: `${table.slice(0, -1)} has been restored successfully.`,
      });

      return true;
    } catch (error) {
      console.error(`Error restoring ${table}:`, error);
      toast({
        title: "Error",
        description: `Failed to restore ${table.slice(0, -1)}. Please try again.`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [table, idField, softDeleteField, reasonField, logAction]);

  return {
    softDelete,
    restore,
    isDeleting
  };
};
