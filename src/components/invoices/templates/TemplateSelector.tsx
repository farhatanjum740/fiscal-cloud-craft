
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TEMPLATE_OPTIONS, InvoiceTemplate } from '@/types/invoice-templates';

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
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="template">{label}</Label>
      <Select
        value={selectedTemplate}
        onValueChange={onTemplateChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select template style" />
        </SelectTrigger>
        <SelectContent>
          {TEMPLATE_OPTIONS.map((template) => (
            <SelectItem key={template.value} value={template.value}>
              <div className="flex flex-col">
                <span className="font-medium">{template.label}</span>
                <span className="text-xs text-muted-foreground">{template.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TemplateSelector;
