
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { InvoiceTemplate, TEMPLATE_OPTIONS } from '@/types/invoice-templates';
import { TemplateRenderer } from './TemplateRenderer';
import { generateSampleInvoiceData, generateSampleCustomerData, generateSampleCompanyData } from '@/utils/sampleInvoiceData';

interface TemplatePreviewCardProps {
  template: InvoiceTemplate;
  isSelected: boolean;
  onSelect: (template: InvoiceTemplate) => void;
  disabled?: boolean;
}

export const TemplatePreviewCard: React.FC<TemplatePreviewCardProps> = ({
  template,
  isSelected,
  onSelect,
  disabled = false
}) => {
  const templateOption = TEMPLATE_OPTIONS.find(opt => opt.value === template);
  const sampleInvoice = { ...generateSampleInvoiceData(), template };
  const sampleCustomer = generateSampleCustomerData();
  const sampleCompany = generateSampleCompanyData();

  return (
    <Card className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-primary shadow-lg' : ''
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm">{templateOption?.label}</h3>
            <p className="text-xs text-muted-foreground">{templateOption?.description}</p>
          </div>
          {isSelected && (
            <Badge variant="default" className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Selected
            </Badge>
          )}
        </div>
        
        <div 
          className="border rounded-lg overflow-hidden mb-3 bg-white"
          style={{ 
            height: '300px',
            transform: 'scale(0.3)',
            transformOrigin: 'top left',
            width: '333%' // Scale factor to fit the preview
          }}
        >
          <div className="pointer-events-none">
            <TemplateRenderer
              template={template}
              invoice={sampleInvoice}
              customer={sampleCustomer}
              company={sampleCompany}
              isDownloadable={false}
            />
          </div>
        </div>
        
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="w-full"
          onClick={() => onSelect(template)}
          disabled={disabled}
        >
          {isSelected ? 'Selected' : 'Select Template'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TemplatePreviewCard;
