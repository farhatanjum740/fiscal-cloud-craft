
import { createClient } from 'npm:@supabase/supabase-js';
import { Resend } from 'npm:resend';
import * as React from 'npm:react';

interface InvoiceEmailProps {
  logoURL: string;
  company: any;
  message: string;
  document: any;
  isInvoice: boolean;
}

// Improved React email template component
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
            React.createElement('h1', { style: { margin: '0 0 10px 0' } }, documentType),
            React.createElement('p', { style: { margin: '0', fontSize: '16px' } }, `# ${documentNumber}`)
          ),
          logoURL && React.createElement('img', { 
            src: logoURL, 
            alt: `${company.name} logo`, 
            style: { maxHeight: '60px', maxWidth: '100px', display: 'block' } 
          })
        ),
        React.createElement('hr', { style: { border: '1px solid #eee', margin: '20px 0' } }),
        React.createElement('div', { style: { marginBottom: '20px', whiteSpace: 'pre-wrap' } }, message),
        React.createElement('hr', { style: { border: '1px solid #eee', margin: '20px 0' } }),
        React.createElement(
          'div', 
          null,
          React.createElement('p', { style: { margin: '0 0 5px 0' } }, `Best Regards,`),
          React.createElement('p', { style: { fontWeight: 'bold', margin: '0 0 5px 0' } }, company.name),
          company.email_id && React.createElement(
            'p', 
            { style: { margin: '0 0 5px 0' } }, 
            React.createElement('a', { href: `mailto:${company.email_id}`, style: { color: '#007bff' } }, company.email_id)
          ),
          company.contact_number && React.createElement('p', { style: { margin: '0 0 5px 0' } }, `Phone: ${company.contact_number}`)
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
  pdfBase64?: string;
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
    
    const { invoiceId, creditNoteId, recipientEmail, subject, message, pdfBase64 } = requestData as EmailInvoiceRequest;
    
    console.log("Parsed request data:", { invoiceId, creditNoteId, recipientEmail, subject, message, hasPdf: !!pdfBase64 });
    
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
    let companyId = '';
    let customerId = '';
    
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
      
      if (document) {
        companyId = document.company_id;
        customerId = document.customer_id;
      }
    } else {
      console.log("Fetching credit note with ID:", creditNoteId);
      documentId = creditNoteId as string;
      isInvoice = false;
      
      // First get the credit note
      const creditNoteResult = await supabase
        .from("credit_notes")
        .select("*, company_id, invoice_id")
        .eq("id", creditNoteId)
        .single();
      document = creditNoteResult.data;
      documentError = creditNoteResult.error;
      console.log("Credit note query result:", { data: document, error: documentError });
      
      if (document && document.invoice_id) {
        companyId = document.company_id;
        
        // Then get the invoice to find the customer
        const invoiceResult = await supabase
          .from("invoices")
          .select("customer_id")
          .eq("id", document.invoice_id)
          .single();
          
        if (invoiceResult.data) {
          customerId = invoiceResult.data.customer_id;
        }
      }
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
    
    if (!companyId) {
      console.error("Company ID not found in document:", document);
      return new Response(
        JSON.stringify({ error: "Company ID not found in document." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    let logoURL = '';
    try {
      const { data: logoData } = await supabase.storage
        .from('logos')
        .getPublicUrl(`${companyId}/logo.png`);
      
      // First try with company ID as path
      logoURL = logoData.publicUrl;
      console.log("Trying logo URL with company ID:", logoURL);
      
      // Verify if the logo URL is accessible by sending a HEAD request
      try {
        const logoResponse = await fetch(logoURL, { method: 'HEAD' });
        if (!logoResponse.ok) {
          console.warn(`Logo not found at primary path: ${logoURL}. Status: ${logoResponse.status}`);
          logoURL = ''; // Reset if not accessible
        }
      } catch (headError) {
        console.warn("Error checking logo URL:", headError);
        logoURL = '';
      }
      
      // If logo wasn't found with company ID, try with user ID
      if (!logoURL && company.user_id) {
        const { data: userLogoData } = await supabase.storage
          .from('logos')
          .getPublicUrl(`${company.user_id}/logo.png`);
        
        logoURL = userLogoData.publicUrl;
        console.log("Trying alternative logo URL with user ID:", logoURL);
        
        // Verify the alternative logo URL
        try {
          const altLogoResponse = await fetch(logoURL, { method: 'HEAD' });
          if (!altLogoResponse.ok) {
            console.warn(`Logo also not found at alternative path: ${logoURL}`);
            logoURL = ''; // Reset if not accessible
          }
        } catch (altHeadError) {
          console.warn("Error checking alternative logo URL:", altHeadError);
          logoURL = '';
        }
      }
    } catch (error) {
      console.warn("Error getting logo URL:", error);
      logoURL = '';
    }

    // Initialize Resend client
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Use the verified domain email for sender
    const fromEmail = "support@invoiceninja.in";
    
    console.log(`Sending email from ${fromEmail} to ${customerEmail}`);

    // Prepare attachment if PDF data is provided
    const documentType = isInvoice ? "Invoice" : "Credit Note";
    const documentNumber = isInvoice ? document.invoice_number : document.credit_note_number;
    const attachmentName = `${documentType}-${documentNumber}.pdf`;
    
    // Prepare email options
    const emailOptions: any = {
      from: fromEmail,
      to: [customerEmail],
      subject: subject,
      react: InvoiceEmail({
        logoURL: logoURL,
        company: company,
        message: message,
        document: document,
        isInvoice: isInvoice
      })
    };
    
    // Add attachment if PDF data was provided
    if (pdfBase64) {
      console.log("Adding PDF attachment to email");
      emailOptions.attachments = [
        {
          filename: attachmentName,
          content: pdfBase64,
          encoding: 'base64'
        }
      ];
    } else {
      console.log("No PDF attachment provided");
      // Add a note to the message that there's no attachment
      emailOptions.react = InvoiceEmail({
        logoURL: logoURL,
        company: company,
        message: message + `\n\nNote: Please visit your account dashboard to download a copy of this ${documentType.toLowerCase()}.`,
        document: document,
        isInvoice: isInvoice
      });
    }
    
    // Send the email
    const emailResult = await resend.emails.send(emailOptions);

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

  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: `An unexpected error occurred: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
