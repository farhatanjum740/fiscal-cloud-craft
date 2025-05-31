
export type InvoiceTemplate = 'standard' | 'tally' | 'busy' | 'zoho' | 'classic';

export interface TemplateOption {
  value: InvoiceTemplate;
  label: string;
  description: string;
  preview?: string;
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    value: 'standard',
    label: 'Standard',
    description: 'Clean and professional format'
  },
  {
    value: 'tally',
    label: 'Tally Style',
    description: 'Traditional Tally-inspired format'
  },
  {
    value: 'busy',
    label: 'Busy Style',
    description: 'Busy Accounting-inspired layout'
  },
  {
    value: 'zoho',
    label: 'Zoho Style',
    description: 'Modern Zoho-inspired design'
  },
  {
    value: 'classic',
    label: 'Classic',
    description: 'Traditional invoice format'
  }
];
