
import React from "react";
import { InvoiceTemplate } from '@/types/invoice-templates';
import CreditNoteView from '../view/CreditNoteView';
import TallyCreditNoteView from './TallyCreditNoteView';
import BusyCreditNoteView from './BusyCreditNoteView';
import ZohoCreditNoteView from './ZohoCreditNoteView';
import ClassicCreditNoteView from './ClassicCreditNoteView';

interface CreditNoteTemplateRendererProps {
  template: InvoiceTemplate;
  creditNote: any;
  company: any;
  invoice: any;
  customer: any;
  isDownloadable?: boolean;
}

const CreditNoteTemplateRenderer: React.FC<CreditNoteTemplateRendererProps> = ({
  template,
  creditNote,
  company,
  invoice,
  customer,
  isDownloadable = true
}) => {
  switch (template) {
    case 'tally':
      return <TallyCreditNoteView creditNote={creditNote} company={company} invoice={invoice} customer={customer} isDownloadable={isDownloadable} />;
    case 'busy':
      return <BusyCreditNoteView creditNote={creditNote} company={company} invoice={invoice} customer={customer} isDownloadable={isDownloadable} />;
    case 'zoho':
      return <ZohoCreditNoteView creditNote={creditNote} company={company} invoice={invoice} customer={customer} isDownloadable={isDownloadable} />;
    case 'classic':
      return <ClassicCreditNoteView creditNote={creditNote} company={company} invoice={invoice} customer={customer} isDownloadable={isDownloadable} />;
    case 'standard':
    default:
      return <CreditNoteView creditNote={creditNote} company={company} invoice={invoice} customer={customer} isDownloadable={isDownloadable} />;
  }
};

export default CreditNoteTemplateRenderer;
