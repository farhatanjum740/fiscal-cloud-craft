
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentState {
  plan: 'freemium' | 'premium';
  billingCycle: 'monthly' | 'yearly';
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  const state = location.state as PaymentState;
  const { plan, billingCycle } = state || { plan: 'premium', billingCycle: 'monthly' };
  
  const amount = billingCycle === 'monthly' ? 139 : 1500;
  const displayAmount = billingCycle === 'monthly' ? '₹139/month' : '₹1,500/year (Save 10%)';
  const gstAmount = Math.round(amount * 0.18);
  const totalAmount = amount + gstAmount;
  
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [user, navigate]);
  
  const handlePayment = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real implementation, you would call your backend to create an order
      // For demo purposes, we'll simulate the response
      const orderData = {
        id: 'order_' + Math.random().toString(36).substring(2, 15),
        amount: totalAmount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: 'receipt_' + Date.now()
      };
      
      const options = {
        key: 'rzp_test_YOUR_KEY_HERE', // Replace with actual test key in production
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Invoice App',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${billingCycle} subscription`,
        order_id: orderData.id,
        handler: async function(response: any) {
          try {
            // After successful payment, create subscription in database
            const { data: subscription, error: subscriptionError } = await supabase
              .from('subscriptions')
              .insert({
                user_id: user.id,
                plan: plan,
                start_date: new Date().toISOString(),
                end_date: billingCycle === 'monthly' 
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
                  : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                active: true,
                payment_id: response.razorpay_payment_id,
              })
              .select()
              .single();
            
            if (subscriptionError) throw subscriptionError;
            
            // Record payment history
            await supabase.from('payment_history').insert({
              user_id: user.id,
              subscription_id: subscription.id,
              amount: totalAmount,
              payment_id: response.razorpay_payment_id,
              payment_method: 'razorpay',
              status: 'completed'
            });
            
            toast({
              title: "Payment Successful",
              description: `You have successfully subscribed to the ${plan} plan!`,
            });
            
            navigate('/app/dashboard');
          } catch (error: any) {
            console.error('Error saving subscription:', error);
            toast({
              title: "Error",
              description: "Payment was successful but we couldn't update your subscription. Please contact support.",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email,
        },
        theme: {
          color: '#3B82F6',
        },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong with payment initialization",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!scriptLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Subscription</CardTitle>
          <CardDescription>
            You're subscribing to the {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan with {billingCycle} billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subscription fee</span>
              <span>{displayAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{gstAmount}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₹${totalAmount}`
            )}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => navigate('/pricing')}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Payment;
