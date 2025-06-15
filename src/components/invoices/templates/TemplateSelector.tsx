
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InvoiceTemplate } from '@/types/invoice-templates';
import { useTemplatesByPlan } from '@/hooks/useTemplatesByPlan';
import { Lock } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: InvoiceTemplate;
  onTemplateChange: (template: InvoiceTemplate) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
  disabled = false,
  label = "Invoice Template",
  className = ""
}) => {
  const { getAvailableTemplateOptions, canUseTemplate, currentPlan } = useTemplatesByPlan();
  const availableOptions = getAvailableTemplateOptions();

  const handleTemplateChange = (value: InvoiceTemplate) => {
    if (canUseTemplate(value)) {
      onTemplateChange(value);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="template">
        {label}
        <Badge variant="outline" className="ml-2">
          {currentPlan}
        </Badge>
      </Label>
      <Select
        value={selectedTemplate}
        onValueChange={handleTemplateChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select template style" />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.map((template) => (
            <SelectItem key={template.value} value={template.value}>
              <div className="flex flex-col">
                <span className="font-medium">{template.label}</span>
                <span className="text-xs text-muted-foreground">{template.description}</span>
              </div>
            </SelectItem>
          ))}
          
          {currentPlan !== 'professional' && (
            <div className="p-2 text-sm text-muted-foreground border-t">
              <div className="flex items-center gap-2">
                <Lock className="h-3 w-3" />
                <span>More templates available with higher plans</span>
              </div>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TemplateSelector;
