
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, Zap } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { InvoiceTemplate } from '@/types/invoice-templates';
import { TemplatePreviewCard } from '@/components/invoices/templates/TemplatePreviewCard';
import { useInvoiceTemplate } from '@/hooks/useInvoiceTemplate';
import { useTemplatesByPlan } from '@/hooks/useTemplatesByPlan';

interface InvoiceSettingsProps {
  companyId?: string;
}

export const InvoiceSettings: React.FC<InvoiceSettingsProps> = ({ companyId }) => {
  const { selectedTemplate, setSelectedTemplate, defaultTemplate, updateDefaultTemplate, loading } = useInvoiceTemplate(companyId, undefined, true);
  const { getAvailableTemplateOptions, canUseTemplate, getTemplateCount, currentPlan } = useTemplatesByPlan();

  const availableOptions = getAvailableTemplateOptions();
  const allTemplates = [
    { value: 'standard', label: 'Standard', description: 'Clean and professional format' },
    { value: 'tally', label: 'Tally Style', description: 'Traditional Tally-inspired format' },
    { value: 'busy', label: 'Busy Style', description: 'Busy Accounting-inspired layout' },
    { value: 'zoho', label: 'Zoho Style', description: 'Modern Zoho-inspired design' },
    { value: 'classic', label: 'Classic', description: 'Traditional invoice format' }
  ];

  const handleTemplateSelect = (template: InvoiceTemplate) => {
    if (canUseTemplate(template)) {
      setSelectedTemplate(template);
    } else {
      toast({
        title: "Template Not Available",
        description: `This template requires a higher subscription plan. You have ${getTemplateCount()} templates available on the ${currentPlan} plan.`,
        variant: "destructive"
      });
    }
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

    if (!canUseTemplate(selectedTemplate)) {
      toast({
        title: "Error",
        description: "Selected template is not available in your current plan",
        variant: "destructive"
      });
      return;
    }

    const success = await updateDefaultTemplate(selectedTemplate);
    if (success) {
      const templateLabel = allTemplates.find(t => t.value === selectedTemplate)?.label;
      toast({
        title: "Success",
        description: `Default invoice template updated to ${templateLabel}`,
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
          <CardTitle className="flex items-center gap-2">
            Default Invoice Template
            <Badge variant="outline">{currentPlan}</Badge>
            <Badge variant="secondary">{getTemplateCount()} templates</Badge>
          </CardTitle>
          <CardDescription>
            Choose a default template for all new invoices. Your {currentPlan} plan includes {getTemplateCount()} template{getTemplateCount() > 1 ? 's' : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {allTemplates.map((template) => {
              const isAvailable = canUseTemplate(template.value as InvoiceTemplate);
              const isSelected = selectedTemplate === template.value;
              
              return (
                <div key={template.value} className="relative">
                  <TemplatePreviewCard
                    template={template.value as InvoiceTemplate}
                    isSelected={isSelected}
                    onSelect={handleTemplateSelect}
                    disabled={loading || !isAvailable}
                  />
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        <Lock className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">Upgrade Required</p>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="mt-2"
                          onClick={() => window.location.href = '/app/subscription'}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {hasChanges && canUseTemplate(selectedTemplate) && (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Template changed to {allTemplates.find(t => t.value === selectedTemplate)?.label}
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

          {currentPlan === 'freemium' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Limited Templates</span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                You have access to 1 template on the freemium plan. Upgrade to unlock more professional templates.
              </p>
              <Button
                size="sm"
                onClick={() => window.location.href = '/app/subscription'}
              >
                <Zap className="h-3 w-3 mr-1" />
                Upgrade Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceSettings;
