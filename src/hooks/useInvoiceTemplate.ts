
import { useState, useEffect } from 'react';
import { InvoiceTemplate } from '@/types/invoice-templates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useInvoiceTemplate = (companyId?: string, currentTemplate?: InvoiceTemplate) => {
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate>(currentTemplate || 'standard');
  const [defaultTemplate, setDefaultTemplate] = useState<InvoiceTemplate>('standard');
  const [loading, setLoading] = useState(false);

  // Fetch company's default template
  useEffect(() => {
    const fetchDefaultTemplate = async () => {
      if (!companyId) return;

      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('default_template')
          .eq('company_id', companyId)
          .single();

        if (error) {
          console.error('Error fetching default template:', error);
          return;
        }

        if (data?.default_template) {
          setDefaultTemplate(data.default_template as InvoiceTemplate);
          if (!currentTemplate) {
            setSelectedTemplate(data.default_template as InvoiceTemplate);
          }
        }
      } catch (error) {
        console.error('Error fetching default template:', error);
      }
    };

    fetchDefaultTemplate();
  }, [companyId, currentTemplate]);

  const updateDefaultTemplate = async (template: InvoiceTemplate) => {
    if (!companyId) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('company_settings')
        .update({ default_template: template })
        .eq('company_id', companyId);

      if (error) {
        console.error('Error updating default template:', error);
        toast({
          title: "Error",
          description: "Failed to update default template",
          variant: "destructive"
        });
        return false;
      }

      setDefaultTemplate(template);
      toast({
        title: "Success",
        description: "Default template updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Error updating default template:', error);
      toast({
        title: "Error",
        description: "Failed to update default template",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedTemplate,
    setSelectedTemplate,
    defaultTemplate,
    updateDefaultTemplate,
    loading
  };
};
