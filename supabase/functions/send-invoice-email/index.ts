
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up Resend client
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface EmailInvoiceRequest {
  invoiceId?: string;
  creditNoteId?: string;
  recipientEmail: string;
  subject?: string;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log request for debugging
    console.log("Request received:", req.method);
    
    const requestData = await req.json();
    console.log("Request data:", JSON.stringify(requestData));
    
    const { invoiceId, creditNoteId, recipientEmail, subject, message } = requestData as EmailInvoiceRequest;
    
    console.log("Parsed request data:", { invoiceId, creditNoteId, recipientEmail, subject, message });
    
    if ((!invoiceId && !creditNoteId) || !recipientEmail) {
      console.error("Missing required fields:", { invoiceId, creditNoteId, recipientEmail });
      return new Response(
        JSON.stringify({ error: "Invoice/Credit Note ID and recipient email are required" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Set document type and ID based on what we're sending
    const isInvoice = !!invoiceId;
    const documentId = invoiceId || creditNoteId;
    const documentType = isInvoice ? 'invoice' : 'credit_note';
    
    console.log(`Processing ${documentType} with ID: ${documentId}`);

    // Get document data
    let document, documentError;
    if (isInvoice) {
      const result = await supabase
        .from("invoices")
        .select("*")
        .eq("id", documentId)
        .single();
      document = result.data;
      documentError = result.error;
      console.log("Invoice query result:", { data: document, error: documentError });
    } else {
      const result = await supabase
        .from("credit_notes")
        .select("*")
        .eq("id", documentId)
        .single();
      document = result.data;
      documentError = result.error;
      console.log("Credit note query result:", { data: document, error: documentError });
    }

    if (documentError || !document) {
      console.error(`Error fetching ${documentType}:`, documentError);
      return new Response(
        JSON.stringify({ error: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} not found` }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Get company data
    const companyId = isInvoice ? document.company_id : document.company_id;
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      console.error("Error fetching company:", companyError);
      return new Response(
        JSON.stringify({ error: "Company not found" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Get customer data
    const customerId = isInvoice ? document.customer_id : document.customer_id;
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      console.error("Error fetching customer:", customerError);
      return new Response(
        JSON.stringify({ error: "Customer not found" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Get document items
    let documentItems, itemsError;
    if (isInvoice) {
      const result = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", documentId);
      documentItems = result.data;
      itemsError = result.error;
    } else {
      const result = await supabase
        .from("credit_note_items")
        .select("*")
        .eq("credit_note_id", documentId);
      documentItems = result.data;
      itemsError = result.error;
    }

    if (itemsError) {
      console.error(`Error fetching ${documentType} items:`, itemsError);
      return new Response(
        JSON.stringify({ error: `Could not fetch ${documentType} items` }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Prepare document information
    const documentNumber = isInvoice ? document.invoice_number : document.credit_note_number;
    const documentDate = isInvoice ? document.invoice_date : document.credit_note_date;
    const totalAmount = document.total_amount || 0;
    
    // Build email content
    const emailSubject = subject || `${isInvoice ? 'Invoice' : 'Credit Note'} ${documentNumber} from ${company.name}`;
    const emailMessage = message || `Please find attached the ${isInvoice ? 'invoice' : 'credit note'} ${documentNumber} from ${company.name}.`;
    
    const emailHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .message { margin-bottom: 20px; }
            .document-details { margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
            .company-info { margin-bottom: 20px; }
            .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${isInvoice ? 'Invoice' : 'Credit Note'} ${documentNumber}</h2>
            </div>
            
            <div class="message">
              <p>${emailMessage}</p>
            </div>
            
            <div class="document-details">
              <p><strong>${isInvoice ? 'Invoice' : 'Credit Note'} Number:</strong> ${documentNumber}</p>
              <p><strong>Date:</strong> ${new Date(documentDate).toLocaleDateString()}</p>
              ${isInvoice && document.due_date ? `<p><strong>Due Date:</strong> ${new Date(document.due_date).toLocaleDateString()}</p>` : ''}
              <p><strong>Amount:</strong> ₹${Number(totalAmount).toFixed(2)}</p>
            </div>
            
            <div class="company-info">
              <p><strong>From:</strong> ${company.name}</p>
              <p>${company.address_line1}</p>
              ${company.address_line2 ? `<p>${company.address_line2}</p>` : ''}
              <p>${company.city}, ${company.state} ${company.pincode}</p>
              <p>GSTIN: ${company.gstin}</p>
            </div>
            
            <p>Please see the attached PDF for complete details.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Generate a download URL
    const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
    const viewUrl = `${baseUrl}/app/${isInvoice ? 'invoices' : 'credit-notes'}/view/${documentId}?download=true`;
    
    console.log("Sending email to:", recipientEmail);
    console.log("Email subject:", emailSubject);
    console.log("View URL:", viewUrl);

    // Send email with "attachment" link pointing to view URL
    const emailResponse = await resend.emails.send({
      from: `${company.name} <onboarding@resend.dev>`,
      to: [recipientEmail],
      subject: emailSubject,
      html: emailHtml,
      text: `${isInvoice ? 'Invoice' : 'Credit Note'} ${documentNumber} from ${company.name}. View online at: ${viewUrl}`,
    });

    console.log("Email send response:", JSON.stringify(emailResponse));

    if (emailResponse.error) {
      throw new Error(emailResponse.error.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.id }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
    
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
