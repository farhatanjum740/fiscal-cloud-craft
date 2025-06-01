
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
          .maybeSingle();

        if (error) {
          console.error('Error fetching default template:', error);
          return;
        }

        if (data?.default_template) {
          const template = data.default_template as InvoiceTemplate;
          setDefaultTemplate(template);
          // Only set as selected template if no current template is provided
          if (!currentTemplate) {
            setSelectedTemplate(template);
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
      // Check if company_settings record exists
      const { data: existingSettings } = await supabase
        .from('company_settings')
        .select('id')
        .eq('company_id', companyId)
        .maybeSingle();

      if (existingSettings) {
        // Update existing record
        const { error } = await supabase
          .from('company_settings')
          .update({ default_template: template })
          .eq('company_id', companyId);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('company_settings')
          .insert({
            company_id: companyId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            default_template: template
          });

        if (error) throw error;
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
