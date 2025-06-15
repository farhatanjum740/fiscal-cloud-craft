
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
      toast({
        title: "Error",
        description: "Company ID is required to update template",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    console.log("=== STARTING TEMPLATE UPDATE PROCESS ===");
    console.log("Template to save:", template);
    console.log("Company ID:", companyId);
    
    try {
      // Step 1: Verify user authentication
      console.log("Step 1: Checking user authentication");
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error("User authentication failed:", userError);
        toast({
          title: "Error",
          description: "You must be logged in to update template settings",
          variant: "destructive"
        });
        return false;
      }
      console.log("User authenticated successfully:", userData.user.id);

      // Step 2: Check if company_settings record exists
      console.log("Step 2: Checking existing company settings");
      const { data: existingSettings, error: fetchError } = await supabase
        .from('company_settings')
        .select('id, default_template, company_id, user_id')
        .eq('company_id', companyId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching existing settings:", fetchError);
        toast({
          title: "Error",
          description: `Database error: ${fetchError.message}`,
          variant: "destructive"
        });
        return false;
      }

      console.log("Existing settings query result:", existingSettings);

      let updateResult;

      if (existingSettings) {
        console.log("Step 3a: Updating existing record");
        console.log("Existing record ID:", existingSettings.id);
        console.log("Current template in DB:", existingSettings.default_template);
        
        // Update existing record
        const { data: updateData, error: updateError } = await supabase
          .from('company_settings')
          .update({ 
            default_template: template,
            updated_at: new Date().toISOString()
          })
          .eq('company_id', companyId)
          .select('id, default_template, updated_at')
          .single();

        if (updateError) {
          console.error("Error updating company settings:", updateError);
          toast({
            title: "Error",
            description: `Failed to update template: ${updateError.message}`,
            variant: "destructive"
          });
          return false;
        }

        updateResult = updateData;
        console.log("Update successful:", updateData);
      } else {
        console.log("Step 3b: Creating new record");
        
        // Create new record
        const { data: insertData, error: insertError } = await supabase
          .from('company_settings')
          .insert({
            company_id: companyId,
            user_id: userData.user.id,
            default_template: template
          })
          .select('id, default_template, created_at')
          .single();

        if (insertError) {
          console.error("Error creating company settings:", insertError);
          toast({
            title: "Error",
            description: `Failed to create template setting: ${insertError.message}`,
            variant: "destructive"
          });
          return false;
        }

        updateResult = insertData;
        console.log("Insert successful:", insertData);
      }

      // Step 4: Verify the update was successful
      console.log("Step 4: Verifying database update");
      if (updateResult?.default_template !== template) {
        console.error("Database update verification failed!");
        console.error("Expected:", template);
        console.error("Got:", updateResult?.default_template);
        toast({
          title: "Error",
          description: "Database update verification failed",
          variant: "destructive"
        });
        return false;
      }

      console.log("Database update verified successfully");

      // Step 5: Update local state
      console.log("Step 5: Updating local state");
      setDefaultTemplate(template);
      if (forSettings) {
        setSelectedTemplate(template);
      }
      
      console.log("=== TEMPLATE UPDATE COMPLETED SUCCESSFULLY ===");
      toast({
        title: "Success",
        description: "Template updated - all invoices and credit notes will now use this template"
      });
      return true;
    } catch (error) {
      console.error('Unexpected error in updateDefaultTemplate:', error);
      toast({
        title: "Error",
        description: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
