
import { createClient } from 'npm:@supabase/supabase-js';
import { Resend } from 'npm:resend';
import { InvoiceEmail } from '../../emails/invoice';

interface EmailInvoiceRequest {
  invoiceId?: string;
  creditNoteId?: string;
  recipientEmail: string;
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
    
    if ((!invoiceId && !creditNoteId) || !recipientEmail) {
      console.error("Missing required fields:", { invoiceId, creditNoteId, recipientEmail });
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields. Must provide either invoiceId or creditNoteId, and recipientEmail."
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

    if (!company) {
      console.error("Company not found:", companyId);
      return new Response(
        JSON.stringify({ error: "Company not found." }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the logo URL from storage
    const { data: logoData } = await supabase.storage
      .from('logos')
      .getPublicUrl(`${companyId}/logo.png`);

    const logoURL = logoData.publicUrl;

    // Initialize Resend client
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Send the email
    const emailResult = await resend.emails.send({
      from: `${company.name} <${company.email}>`,
      to: [recipientEmail],
      subject: subject,
      react: InvoiceEmail({
        logoURL: logoURL,
        company: company,
        message: message,
        document: document,
        isInvoice: isInvoice
      }),
    });

    if (emailResult.error) {
      console.error("Error sending email:", emailResult.error);
      return new Response(
        JSON.stringify({ error: `Failed to send email: ${emailResult.error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
