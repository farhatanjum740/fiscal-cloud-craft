
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { InvoiceTemplate, TEMPLATE_OPTIONS } from '@/types/invoice-templates';
import { TemplatePreviewCard } from '@/components/invoices/templates/TemplatePreviewCard';
import { useInvoiceTemplate } from '@/hooks/useInvoiceTemplate';

interface InvoiceSettingsProps {
  companyId?: string;
}

export const InvoiceSettings: React.FC<InvoiceSettingsProps> = ({ companyId }) => {
  // Use the hook in settings mode (forSettings = true)
  const { selectedTemplate, setSelectedTemplate, defaultTemplate, updateDefaultTemplate, loading } = useInvoiceTemplate(companyId, undefined, true);

  const handleTemplateSelect = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
  };

  const handleSaveTemplate = async () => {
    if (!companyId) {
      toast({
        title: "Error",
        description: "Company ID is required to save template settings",
        variant: "destructive"
      });
      return;
    }

    const success = await updateDefaultTemplate(selectedTemplate);
    if (success) {
      toast({
        title: "Success",
        description: `Default invoice template updated to ${TEMPLATE_OPTIONS.find(t => t.value === selectedTemplate)?.label}`,
      });
    }
  };

  const hasChanges = selectedTemplate !== defaultTemplate;

  if (!companyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
          <CardDescription>Company information is required to manage invoice settings</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Default Invoice Template</CardTitle>
          <CardDescription>
            Choose a default template for all new invoices. You can still change the template for individual invoices when creating them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {TEMPLATE_OPTIONS.map((template) => (
              <TemplatePreviewCard
                key={template.value}
                template={template.value}
                isSelected={selectedTemplate === template.value}
                onSelect={handleTemplateSelect}
                disabled={loading}
              />
            ))}
          </div>
          
          {hasChanges && (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Template changed to {TEMPLATE_OPTIONS.find(t => t.value === selectedTemplate)?.label}
                </p>
                <p className="text-xs text-blue-700">
                  Click save to apply this template as default for new invoices
                </p>
              </div>
              <Button 
                onClick={handleSaveTemplate} 
                disabled={loading}
                size="sm"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceSettings;
