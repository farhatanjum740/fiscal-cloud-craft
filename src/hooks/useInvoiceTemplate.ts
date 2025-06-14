
import { useState, useEffect } from 'react';
import { InvoiceTemplate } from '@/types/invoice-templates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useInvoiceTemplate = (companyId?: string, currentTemplate?: InvoiceTemplate, forSettings: boolean = false) => {
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate>(currentTemplate || 'standard');
  const [defaultTemplate, setDefaultTemplate] = useState<InvoiceTemplate>('standard');
  const [loading, setLoading] = useState(false);

  // Fetch company's default template
  useEffect(() => {
    const fetchDefaultTemplate = async () => {
      if (!companyId) return;

      try {
        console.log("Fetching default template for company:", companyId);
        
        const { data, error } = await supabase
          .from('company_settings')
          .select('default_template')
          .eq('company_id', companyId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching default template:', error);
          return;
        }

        console.log("Fetched company settings:", data);

        if (data?.default_template) {
          const template = data.default_template as InvoiceTemplate;
          console.log("Setting default template to:", template);
          setDefaultTemplate(template);
          
          // For settings mode, always use the database value as selected
          if (forSettings) {
            console.log("Settings mode: using database template as selected:", template);
            setSelectedTemplate(template);
          } else if (!currentTemplate) {
            // For non-settings mode, only set as selected if no current template is provided
            console.log("No current template, using default:", template);
            setSelectedTemplate(template);
          } else {
            console.log("Using current template:", currentTemplate);
            setSelectedTemplate(currentTemplate);
          }
        } else {
          console.log("No default template found, using standard");
          const fallbackTemplate = 'standard';
          setDefaultTemplate(fallbackTemplate);
          
          // For settings mode, always sync selected with default
          if (forSettings || !currentTemplate) {
            setSelectedTemplate(fallbackTemplate);
          }
        }
      } catch (error) {
        console.error('Error fetching default template:', error);
      }
    };

    fetchDefaultTemplate();
  }, [companyId, currentTemplate, forSettings]);

  const updateDefaultTemplate = async (template: InvoiceTemplate) => {
    if (!companyId) return false;

    setLoading(true);
    try {
      console.log("Updating default template to:", template);
      
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

      // Update both states to reflect the saved value
      setDefaultTemplate(template);
      if (forSettings) {
        setSelectedTemplate(template);
      }
      
      console.log("Successfully updated default template");
      toast({
        title: "Success",
        description: "Template updated - all invoices and credit notes will now use this template"
      });
      return true;
    } catch (error) {
      console.error('Error updating default template:', error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // New function to get the current company template for viewing
  const getCurrentCompanyTemplate = async (companyId: string): Promise<InvoiceTemplate> => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('default_template')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching company template:', error);
        return 'standard';
      }

      return (data?.default_template as InvoiceTemplate) || 'standard';
    } catch (error) {
      console.error('Error fetching company template:', error);
      return 'standard';
    }
  };

  return {
    selectedTemplate,
    setSelectedTemplate,
    defaultTemplate,
    updateDefaultTemplate,
    getCurrentCompanyTemplate,
    loading
  };
};
