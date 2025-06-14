
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== RAZORPAY ORDER CREATION STARTED ===");
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    if (!authHeader) {
      console.error("No authorization header provided");
      throw new Error('Authentication required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("User authentication failed:", userError);
      throw new Error('User not authenticated');
    }

    const user = userData.user;
    console.log("User authenticated successfully:", user.id);

    const requestBody = await req.json();
    const { plan, billingCycle } = requestBody;
    console.log("Request data:", { plan, billingCycle });

    if (!plan || !billingCycle) {
      throw new Error('Missing required parameters: plan and billingCycle');
    }

    // Pricing in INR (paise)
    const pricing = {
      starter: { monthly: 14900, yearly: 149000 }, // ₹149/month, ₹1490/year
      professional: { monthly: 29900, yearly: 299000 } // ₹299/month, ₹2990/year
    };

    if (!pricing[plan as keyof typeof pricing]) {
      throw new Error(`Invalid plan selected: ${plan}`);
    }

    const amount = pricing[plan as keyof typeof pricing][billingCycle as 'monthly' | 'yearly'];
    console.log("Amount to charge:", amount, "paise (₹" + (amount / 100) + ")");

    // Force test mode for now - always use test credentials
    const isTestMode = true;
    console.log("FORCED TEST MODE - Using test credentials");

    const razorpayKeyId = Deno.env.get('RAZORPAY_TEST_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_TEST_KEY_SECRET');

    console.log("Test Key ID available:", !!razorpayKeyId);
    console.log("Test Key Secret available:", !!razorpayKeySecret);

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Test Razorpay credentials missing");
      console.error("Key ID exists:", !!razorpayKeyId);
      console.error("Key Secret exists:", !!razorpayKeySecret);
      throw new Error('Razorpay test credentials not configured properly');
    }

    // Create shorter receipt
    const userIdShort = user.id.replace(/-/g, '').substring(0, 8);
    const timestamp = Date.now().toString().slice(-8);
    const receipt = `test_${userIdShort}_${timestamp}`;
    
    console.log("Generated receipt:", receipt);

    // Create Razorpay order
    const orderData = {
      amount,
      currency: 'INR',
      receipt,
      notes: {
        user_id: user.id,
        plan,
        billing_cycle: billingCycle,
        mode: 'test',
        environment: 'development'
      },
    };

    console.log("Creating Razorpay order with data:", JSON.stringify(orderData, null, 2));

    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    console.log("Using auth string (first 20 chars):", authString.substring(0, 20));

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    console.log("Razorpay API response status:", response.status);
    console.log("Razorpay API response headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("Razorpay API response body:", responseText);

    if (!response.ok) {
      console.error("Razorpay API error - Status:", response.status);
      console.error("Razorpay API error - Body:", responseText);
      throw new Error(`Razorpay API error (${response.status}): ${responseText}`);
    }

    const order = JSON.parse(responseText);
    console.log("Razorpay order created successfully:", order.id);

    const result = { 
      order,
      key: razorpayKeyId,
      mode: 'test'
    };

    console.log("Returning result:", JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('=== ERROR CREATING RAZORPAY ORDER ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check edge function logs for more information'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
