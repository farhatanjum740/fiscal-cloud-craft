
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
    console.log("Starting Razorpay order creation...");
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      console.error("User not authenticated");
      throw new Error('User not authenticated');
    }

    console.log("User authenticated:", user.id);

    const { plan, billingCycle } = await req.json();
    console.log("Plan:", plan, "Billing cycle:", billingCycle);

    // Pricing in INR (paise)
    const pricing = {
      starter: { monthly: 14900, yearly: 149000 }, // ₹149/month, ₹1490/year (10% discount)
      professional: { monthly: 29900, yearly: 299000 } // ₹299/month, ₹2990/year (10% discount)
    };

    if (!pricing[plan as keyof typeof pricing]) {
      throw new Error('Invalid plan selected');
    }

    const amount = pricing[plan as keyof typeof pricing][billingCycle as 'monthly' | 'yearly'];
    console.log("Amount to charge:", amount, "paise (₹" + (amount / 100) + ")");

    // Use test credentials in development/test mode
    const isProduction = Deno.env.get('DENO_DEPLOYMENT_ID') !== undefined;
    const razorpayKeyId = isProduction 
      ? Deno.env.get('RAZORPAY_KEY_ID')
      : Deno.env.get('RAZORPAY_TEST_KEY_ID');
    const razorpayKeySecret = isProduction 
      ? Deno.env.get('RAZORPAY_KEY_SECRET')
      : Deno.env.get('RAZORPAY_TEST_KEY_SECRET');

    console.log("Using", isProduction ? "PRODUCTION" : "TEST", "mode");
    console.log("Razorpay Key ID:", razorpayKeyId?.substring(0, 12) + "...");

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay credentials not configured for", isProduction ? "production" : "test", "mode");
      throw new Error('Razorpay credentials not configured');
    }

    // Create a shorter receipt that fits within 40 characters
    const userIdShort = user.id.replace(/-/g, '').substring(0, 8);
    const timestamp = Date.now().toString().slice(-8);
    const receipt = `ord_${userIdShort}_${timestamp}`;
    
    console.log("Generated receipt:", receipt, "Length:", receipt.length);

    // Create Razorpay order
    const orderData = {
      amount,
      currency: 'INR',
      receipt,
      notes: {
        user_id: user.id,
        plan,
        billing_cycle: billingCycle,
        mode: isProduction ? 'production' : 'test'
      },
    };

    console.log("Order data:", orderData);

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    console.log("Razorpay API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Razorpay API error:", errorText);
      throw new Error(`Failed to create Razorpay order: ${errorText}`);
    }

    const order = await response.json();
    console.log("Razorpay order created successfully:", order.id);

    // Return order with the key for frontend use
    return new Response(JSON.stringify({ 
      order,
      key: razorpayKeyId,
      mode: isProduction ? 'production' : 'test'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
