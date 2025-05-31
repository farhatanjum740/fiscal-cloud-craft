
import { InvoiceTemplate } from '@/types/invoice-templates';

export const generateSampleInvoiceData = () => {
  return {
    id: 'sample-id',
    invoice_number: 'INV/2024-25/0001',
    invoice_date: '2024-03-15',
    due_date: '2024-04-14',
    status: 'paid',
    financial_year: '2024-25',
    subtotal: 10000,
    cgst: 900,
    sgst: 900,
    igst: 0,
    total_amount: 11800,
    terms_and_conditions: '1. Payment is due within 30 days from the date of invoice.\n2. Please include the invoice number as reference when making payment.',
    notes: 'Thank you for your business!',
    template: 'standard' as InvoiceTemplate,
    items: [
      {
        id: '1',
        product_name: 'Web Development Services',
        description: 'Custom website development',
        hsn_code: '998314',
        quantity: 1,
        unit: 'Service',
        price: 8000,
        gst_rate: 18,
        discount_rate: 0
      },
      {
        id: '2',
        product_name: 'SEO Optimization',
        description: 'Search engine optimization',
        hsn_code: '998314',
        quantity: 1,
        unit: 'Service',
        price: 2000,
        gst_rate: 18,
        discount_rate: 0
      }
    ]
  };
};

export const generateSampleCustomerData = () => {
  return {
    id: 'sample-customer-id',
    name: 'Tech Solutions Pvt Ltd',
    email: 'contact@techsolutions.com',
    phone: '+91 98765 43210',
    gstin: '27ABCDE1234F1Z5',
    billing_address_line1: '123 Business Park',
    billing_address_line2: 'Sector 15',
    billing_city: 'Gurgaon',
    billing_state: 'Haryana',
    billing_pincode: '122001',
    shipping_address_line1: '123 Business Park',
    shipping_address_line2: 'Sector 15',
    shipping_city: 'Gurgaon',
    shipping_state: 'Haryana',
    shipping_pincode: '122001'
  };
};

export const generateSampleCompanyData = () => {
  return {
    id: 'sample-company-id',
    name: 'Digital Services India',
    gstin: '07ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    contact_number: '+91 11 4567 8900',
    email_id: 'info@digitalservices.in',
    address_line1: '456 Tech Tower',
    address_line2: 'Phase 2',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    registered_address_line1: '456 Tech Tower',
    registered_address_line2: 'Phase 2',
    registered_city: 'New Delhi',
    registered_state: 'Delhi',
    registered_pincode: '110001',
    bank_account_name: 'Digital Services India',
    bank_account_number: '1234567890123456',
    bank_name: 'HDFC Bank',
    bank_ifsc_code: 'HDFC0001234',
    bank_branch: 'Connaught Place',
    logo: null
  };
};
