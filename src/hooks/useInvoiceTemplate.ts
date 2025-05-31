
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
          .select('*')
          .eq('company_id', companyId)
          .single();

        if (error) {
          console.error('Error fetching default template:', error);
          return;
        }

        // Use type assertion since TypeScript types haven't been updated yet
        const settings = data as any;
        if (settings?.default_template) {
          setDefaultTemplate(settings.default_template as InvoiceTemplate);
          if (!currentTemplate) {
            setSelectedTemplate(settings.default_template as InvoiceTemplate);
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
      // Use type assertion for the update since TypeScript types haven't been updated yet
      const updateData = { default_template: template } as any;
      
      const { error } = await supabase
        .from('company_settings')
        .update(updateData)
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
