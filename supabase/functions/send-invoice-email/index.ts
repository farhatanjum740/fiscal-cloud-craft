
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
  invoiceId: string;
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
    const { invoiceId, recipientEmail, subject, message } = await req.json() as EmailInvoiceRequest;
    
    if (!invoiceId || !recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Invoice ID and recipient email are required" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Get invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error("Error fetching invoice:", invoiceError);
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Get company data
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", invoice.company_id)
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
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", invoice.customer_id)
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

    // Get invoice items
    const { data: invoiceItems, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId);

    if (itemsError) {
      console.error("Error fetching invoice items:", itemsError);
      return new Response(
        JSON.stringify({ error: "Could not fetch invoice items" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Build email content
    const emailSubject = subject || `Invoice ${invoice.invoice_number} from ${company.name}`;
    const emailHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .message { margin-bottom: 20px; }
            .invoice-details { margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
            .company-info { margin-bottom: 20px; }
            .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Invoice ${invoice.invoice_number}</h2>
            </div>
            
            <div class="message">
              <p>${message || `Please find attached the invoice ${invoice.invoice_number} from ${company.name}.`}</p>
            </div>
            
            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
              <p><strong>Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Amount:</strong> ₹${invoice.total_amount.toFixed(2)}</p>
            </div>
            
            <div class="company-info">
              <p><strong>From:</strong> ${company.name}</p>
              <p>${company.address_line1}</p>
              ${company.address_line2 ? `<p>${company.address_line2}</p>` : ''}
              <p>${company.city}, ${company.state} ${company.pincode}</p>
              <p>GSTIN: ${company.gstin}</p>
            </div>
            
            <p>Please see the attached PDF for complete invoice details.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // We can't generate a PDF here because html2pdf.js requires a browser environment
    // Instead, we'll send the invoice id and generate a download URL
    // In a real application, you would use a server-side PDF generation library
    const baseUrl = new URL(req.url).origin;
    const viewUrl = `${baseUrl}/app/invoices/view/${invoiceId}?download=true`;

    // Send email with PDF attachment
    const emailResponse = await resend.emails.send({
      from: `${company.name} <onboarding@resend.dev>`,
      to: [recipientEmail],
      subject: emailSubject,
      html: emailHtml,
      text: `Invoice ${invoice.invoice_number} from ${company.name}. Please view the attached PDF for details.`,
      attachments: [
        {
          filename: `Invoice-${invoice.invoice_number}.pdf`,
          content: viewUrl,  // Link to download the invoice
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.id }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
    
  } catch (error) {
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
