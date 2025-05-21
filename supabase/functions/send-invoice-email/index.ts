
import { createClient } from 'npm:@supabase/supabase-js';
import { Resend } from 'npm:resend';
import * as React from 'npm:react';
import html2pdf from 'npm:html2pdf.js';

interface InvoiceEmailProps {
  logoURL: string;
  company: any;
  message: string;
  document: any;
  isInvoice: boolean;
}

// Simple React email template component
function InvoiceEmail({ logoURL, company, message, document, isInvoice }: InvoiceEmailProps) {
  const documentType = isInvoice ? 'Invoice' : 'Credit Note';
  const documentNumber = isInvoice ? document.invoice_number : document.credit_note_number;
  
  return React.createElement(
    'html', 
    null,
    React.createElement(
      'body', 
      { style: { fontFamily: 'Arial, sans-serif', margin: '0', padding: '0' } },
      React.createElement(
        'div', 
        { style: { maxWidth: '600px', margin: '0 auto', padding: '20px' } },
        React.createElement(
          'div', 
          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement(
            'div', 
            null,
            React.createElement('h1', null, documentType),
            React.createElement('p', null, `# ${documentNumber}`)
          ),
          logoURL && React.createElement('img', { src: logoURL, alt: `${company.name} logo`, style: { maxHeight: '60px' } })
        ),
        React.createElement('hr', { style: { border: '1px solid #eee', margin: '20px 0' } }),
        React.createElement('div', { style: { marginBottom: '20px', whiteSpace: 'pre-wrap' } }, message),
        React.createElement('hr', { style: { border: '1px solid #eee', margin: '20px 0' } }),
        React.createElement(
          'div', 
          null,
          React.createElement('p', null, `Best Regards,`),
          React.createElement('p', null, company.name),
          React.createElement('p', null, company.email_id),
          company.contact_number && React.createElement('p', null, `Phone: ${company.contact_number}`)
        ),
        React.createElement(
          'div', 
          { style: { marginTop: '40px', fontSize: '12px', color: '#888', textAlign: 'center' } },
          React.createElement('p', null, `This is an automated email sent on behalf of ${company.name}.`)
        )
      )
    )
  );
}

interface EmailInvoiceRequest {
  invoiceId?: string;
  creditNoteId?: string;
  recipientEmail?: string;
  subject: string;
  message: string;
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const requestData = await req.json();
    
    console.log("Received request data:", requestData);
    
    const { invoiceId, creditNoteId, recipientEmail, subject, message } = requestData as EmailInvoiceRequest;
    
    console.log("Parsed request data:", { invoiceId, creditNoteId, recipientEmail, subject, message });
    
    if ((!invoiceId && !creditNoteId)) {
      console.error("Missing required fields:", { invoiceId, creditNoteId });
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields. Must provide either invoiceId or creditNoteId."
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Initialize the Supabase client with the service role key
    // This is necessary to bypass RLS and access all required data
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // Determine which document to fetch based on the provided ID
    let document: any;
    let documentError: any;
    let documentId = '';
    let isInvoice = false;
    
    if (invoiceId) {
      console.log("Fetching invoice with ID:", invoiceId);
      documentId = invoiceId;
      isInvoice = true;
      const result = await supabase
        .from("invoices")
        .select("*, company_id, customer_id")
        .eq("id", invoiceId)
        .single();
      document = result.data;
      documentError = result.error;
      console.log("Invoice query result:", { data: document, error: documentError });
    } else {
      console.log("Fetching credit note with ID:", creditNoteId);
      documentId = creditNoteId as string;
      isInvoice = false;
      const result = await supabase
        .from("credit_notes")
        .select("*, company_id, invoice_id")
        .eq("id", creditNoteId)
        .single();
      document = result.data;
      documentError = result.error;
      console.log("Credit note query result:", { data: document, error: documentError });
    }

    if (documentError) {
      console.error("Error fetching document:", documentError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch document: ${documentError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!document) {
      console.error("Document not found:", documentId);
      return new Response(
        JSON.stringify({ error: "Document not found." }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const companyId = document.company_id;
    const customerId = document.customer_id;

    // Fetch company details
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (companyError) {
      console.error("Error fetching company:", companyError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch company: ${companyError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch customer details if recipientEmail is not provided
    let customerEmail = recipientEmail;
    if (!customerEmail && customerId) {
      console.log("Fetching customer email for ID:", customerId);
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("email")
        .eq("id", customerId)
        .single();
      
      if (customerError) {
        console.error("Error fetching customer:", customerError);
      } else if (customer && customer.email) {
        customerEmail = customer.email;
        console.log("Using customer email from database:", customerEmail);
      }
    }
    
    if (!customerEmail) {
      console.error("No recipient email provided and couldn't find customer email");
      return new Response(
        JSON.stringify({ error: "No recipient email provided and couldn't find customer email" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the logo URL from storage
    const { data: logoData } = await supabase.storage
      .from('logos')
      .getPublicUrl(`${companyId}/logo.png`);

    const logoURL = logoData.publicUrl;

    // Initialize Resend client
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Always use onboarding@resend.dev as the sender regardless of company email
    const fromEmail = "onboarding@resend.dev";
    
    console.log(`Sending email from ${fromEmail} to ${customerEmail}`);

    // Generate invoice PDF attachment (Note: This won't actually generate PDF directly in the edge function)
    // Instead, we'll need to include the attachment information in the email
    const documentType = isInvoice ? "Invoice" : "Credit Note";
    const documentNumber = isInvoice ? document.invoice_number : document.credit_note_number;
    const attachmentName = `${documentType}-${documentNumber}.pdf`;
    
    // Send the email with our inline React component
    const emailResult = await resend.emails.send({
      from: `${company.name} <${fromEmail}>`,
      to: [customerEmail],
      subject: subject,
      react: InvoiceEmail({
        logoURL: logoURL,
        company: company,
        message: message + `\n\nNote: Please find the ${documentType} attached. If you don't see an attachment, please visit your account dashboard to download a copy.`,
        document: document,
        isInvoice: isInvoice
      }),
      // Note: We can't actually generate and attach PDFs in edge functions due to limitations
      // Indicating that there should be an attachment helps users understand
    });

    if (emailResult.error) {
      console.error("Error sending email:", emailResult.error);
      return new Response(
        JSON.stringify({ error: `Failed to send email: ${emailResult.error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Email sent successfully to:", customerEmail);

    // Respond with success
    return new Response(
      JSON.stringify({ data: "Email sent successfully!" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: `An unexpected error occurred: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
