
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting payment verification...");
    
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, billingCycle } = await req.json();
    console.log("Payment verification data:", { razorpay_order_id, razorpay_payment_id, plan, billingCycle });

    // Use test credentials in development/test mode
    const isProduction = Deno.env.get('DENO_DEPLOYMENT_ID') !== undefined;
    const razorpayKeySecret = isProduction 
      ? Deno.env.get('RAZORPAY_KEY_SECRET')
      : Deno.env.get('RAZORPAY_TEST_KEY_SECRET');

    console.log("Using", isProduction ? "PRODUCTION" : "TEST", "mode for verification");

    if (!razorpayKeySecret) {
      console.error("Razorpay secret not configured for", isProduction ? "production" : "test", "mode");
      throw new Error('Razorpay secret not configured');
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("Signature verification body:", body);
    
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(razorpayKeySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.error("Payment signature verification failed");
      throw new Error('Payment verification failed');
    }

    console.log("Payment signature verified successfully");

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    console.log("Subscription dates:", { startDate: startDate.toISOString(), endDate: endDate.toISOString() });

    // Deactivate existing subscriptions
    const { error: deactivateError } = await supabaseClient
      .from('subscriptions')
      .update({ active: false })
      .eq('user_id', user.id);

    if (deactivateError) {
      console.error("Error deactivating existing subscriptions:", deactivateError);
    } else {
      console.log("Existing subscriptions deactivated");
    }

    // Create new subscription
    const { error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan: plan as 'starter' | 'professional',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        active: true,
        billing_cycle: billingCycle,
        payment_id: razorpay_payment_id,
        last_payment_date: startDate.toISOString(),
        next_billing_date: endDate.toISOString(),
      });

    if (subscriptionError) {
      console.error("Error creating subscription:", subscriptionError);
      throw subscriptionError;
    }

    console.log("New subscription created successfully");

    // Record payment history with correct amounts
    const amount = plan === 'starter' 
      ? (billingCycle === 'yearly' ? 1490 : 149)
      : (billingCycle === 'yearly' ? 2990 : 299);

    console.log("Recording payment history with amount:", amount);

    const { error: paymentError } = await supabaseClient
      .from('payment_history')
      .insert({
        user_id: user.id,
        amount,
        currency: 'INR',
        payment_id: razorpay_payment_id,
        payment_method: 'razorpay',
        status: 'completed',
      });

    if (paymentError) {
      console.error("Error recording payment history:", paymentError);
    } else {
      console.log("Payment history recorded successfully");
    }

    console.log("Payment verification completed successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
