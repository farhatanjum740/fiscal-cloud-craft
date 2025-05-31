
import React from 'react';
import { InvoiceTemplate } from '@/types/invoice-templates';
import InvoiceView from '@/components/invoices/InvoiceView';
import TallyInvoiceView from './TallyInvoiceView';
import BusyInvoiceView from './BusyInvoiceView';
import ZohoInvoiceView from './ZohoInvoiceView';
import ClassicInvoiceView from './ClassicInvoiceView';

interface TemplateRendererProps {
  template: InvoiceTemplate;
  invoice: any;
  company: any;
  customer: any;
  isDownloadable?: boolean;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  template,
  invoice,
  company,
  customer,
  isDownloadable = true
}) => {
  switch (template) {
    case 'tally':
      return (
        <TallyInvoiceView
          invoice={invoice}
          company={company}
          customer={customer}
          isDownloadable={isDownloadable}
        />
      );
    case 'busy':
      return (
        <BusyInvoiceView
          invoice={invoice}
          company={company}
          customer={customer}
          isDownloadable={isDownloadable}
        />
      );
    case 'zoho':
      return (
        <ZohoInvoiceView
          invoice={invoice}
          company={company}
          customer={customer}
          isDownloadable={isDownloadable}
        />
      );
    case 'classic':
      return (
        <ClassicInvoiceView
          invoice={invoice}
          company={company}
          customer={customer}
          isDownloadable={isDownloadable}
        />
      );
    case 'standard':
    default:
      return (
        <InvoiceView
          invoice={invoice}
          company={company}
          customer={customer}
          isDownloadable={isDownloadable}
        />
      );
  }
};

export default TemplateRenderer;
