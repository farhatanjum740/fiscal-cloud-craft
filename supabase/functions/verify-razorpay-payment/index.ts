
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, billingCycle } = await req.json();

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeySecret) {
      throw new Error('Razorpay secret not configured');
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = await createHmac("sha256", razorpayKeySecret).update(body).digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Payment verification failed');
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Deactivate existing subscriptions
    await supabaseClient
      .from('subscriptions')
      .update({ active: false })
      .eq('user_id', user.id);

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
      throw subscriptionError;
    }

    // Record payment history
    const amount = plan === 'starter' 
      ? (billingCycle === 'yearly' ? 4990 : 499)
      : (billingCycle === 'yearly' ? 9990 : 999);

    await supabaseClient
      .from('payment_history')
      .insert({
        user_id: user.id,
        amount,
        currency: 'INR',
        payment_id: razorpay_payment_id,
        payment_method: 'razorpay',
        status: 'completed',
      });

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
