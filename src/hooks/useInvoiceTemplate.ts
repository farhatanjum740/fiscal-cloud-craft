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
          
          // For settings mode: Always use the database value as the initial selection
          // For non-settings mode: Only use database value if no current template is provided
          if (forSettings) {
            console.log("Settings mode: using database template as selected:", template);
            setSelectedTemplate(template);
          } else if (!currentTemplate) {
            console.log("No current template provided, using database default:", template);
            setSelectedTemplate(template);
          } else {
            console.log("Using provided current template:", currentTemplate);
            setSelectedTemplate(currentTemplate);
          }
        } else {
          console.log("No default template found in database, using standard");
          const fallbackTemplate = 'standard';
          setDefaultTemplate(fallbackTemplate);
          
          // Only set as selected if no template is explicitly provided
          if (!currentTemplate) {
            setSelectedTemplate(fallbackTemplate);
          }
        }
      } catch (error) {
        console.error('Error fetching default template:', error);
      }
    };

    fetchDefaultTemplate();
  }, [companyId, forSettings]); // Add forSettings to dependencies to re-run when mode changes

  const updateDefaultTemplate = async (template: InvoiceTemplate) => {
    if (!companyId) {
      console.error("No company ID provided for template update");
      return false;
    }

    setLoading(true);
    try {
      console.log("Starting template update process for:", template);
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error("Error getting user:", userError);
        throw new Error("User authentication failed");
      }

      console.log("User authenticated, proceeding with template update");

      // Check if company_settings record exists
      const { data: existingSettings, error: fetchError } = await supabase
        .from('company_settings')
        .select('id, default_template')
        .eq('company_id', companyId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching existing settings:", fetchError);
        throw fetchError;
      }

      console.log("Existing settings:", existingSettings);

      let updateResult;

      if (existingSettings) {
        console.log("Updating existing company settings record");
        // Update existing record
        const { data: updateData, error: updateError } = await supabase
          .from('company_settings')
          .update({ default_template: template })
          .eq('company_id', companyId)
          .select('default_template')
          .single();

        if (updateError) {
          console.error("Error updating company settings:", updateError);
          throw updateError;
        }

        updateResult = updateData;
        console.log("Update successful, returned data:", updateData);
      } else {
        console.log("Creating new company settings record");
        // Create new record
        const { data: insertData, error: insertError } = await supabase
          .from('company_settings')
          .insert({
            company_id: companyId,
            user_id: userData.user.id,
            default_template: template
          })
          .select('default_template')
          .single();

        if (insertError) {
          console.error("Error creating company settings:", insertError);
          throw insertError;
        }

        updateResult = insertData;
        console.log("Insert successful, returned data:", insertData);
      }

      // Verify the update was successful
      if (updateResult?.default_template !== template) {
        console.error("Database update verification failed. Expected:", template, "Got:", updateResult?.default_template);
        throw new Error("Database update verification failed");
      }

      console.log("Database update verified successfully");

      // Update both states to reflect the saved value
      setDefaultTemplate(template);
      if (forSettings) {
        setSelectedTemplate(template);
      }
      
      console.log("Local state updated successfully");
      toast({
        title: "Success",
        description: "Template updated - all invoices and credit notes will now use this template"
      });
      return true;
    } catch (error) {
      console.error('Error in updateDefaultTemplate:', error);
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
