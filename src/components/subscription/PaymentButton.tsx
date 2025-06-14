
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentButtonProps {
  plan: 'starter' | 'professional';
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  onSuccess?: () => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ plan, billingCycle, amount, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        console.log('✅ Razorpay already loaded');
        resolve(true);
        return;
      }

      console.log('📥 Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Razorpay script:', error);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with payment",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('🚀 === PAYMENT PROCESS STARTED ===');
    console.log('Plan:', plan, 'Billing:', billingCycle, 'Amount:', amount);

    try {
      // Step 1: Load Razorpay script
      console.log('⏳ Step 1: Loading Razorpay script...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Please check your internet connection and try again.');
      }

      // Step 2: Create Razorpay order
      console.log('⏳ Step 2: Creating Razorpay order...');
      console.log('Making request to create-razorpay-order function with:', { plan, billingCycle });

      const { data: orderResponse, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { plan, billingCycle }
      });

      console.log('📦 Order response received:', orderResponse);
      console.log('❌ Order error (if any):', orderError);

      if (orderError) {
        console.error('💥 Order creation failed:', orderError);
        throw new Error(`Order creation failed: ${orderError.message || JSON.stringify(orderError)}`);
      }

      if (!orderResponse) {
        console.error('💥 No order response received');
        throw new Error('No response received from payment service');
      }

      if (orderResponse.error) {
        console.error('💥 Order response contains error:', orderResponse.error);
        throw new Error(`Payment service error: ${orderResponse.error}`);
      }

      if (!orderResponse.order || !orderResponse.key) {
        console.error('💥 Invalid order response structure:', orderResponse);
        throw new Error('Invalid payment data received from server');
      }

      const { order, key, mode } = orderResponse;
      console.log('✅ Order created successfully:');
      console.log('- Order ID:', order.id);
      console.log('- Amount:', order.amount);
      console.log('- Currency:', order.currency);
      console.log('- Razorpay Key:', key);
      console.log('- Mode:', mode);

      // Step 3: Initialize Razorpay checkout
      console.log('⏳ Step 3: Opening Razorpay checkout...');

      const razorpayOptions = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: 'InvoiceHub',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${billingCycle}`,
        order_id: order.id,
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#0d2252'
        },
        handler: async function (response: any) {
          console.log('🎉 === PAYMENT COMPLETED ===');
          console.log('Payment response:', response);
          
          try {
            console.log('⏳ Verifying payment...');
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'verify-razorpay-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan,
                  billingCycle
                }
              }
            );

            console.log('📦 Verification response:', verifyData);
            console.log('❌ Verification error (if any):', verifyError);

            if (verifyError) {
              console.error('💥 Payment verification failed:', verifyError);
              throw new Error(`Payment verification failed: ${verifyError.message || 'Unknown error'}`);
            }

            if (!verifyData?.success) {
              console.error('💥 Payment verification returned false');
              throw new Error('Payment verification failed - invalid signature');
            }

            console.log('✅ Payment verified successfully!');

            toast({
              title: "Payment Successful!",
              description: "Your subscription has been activated.",
            });

            setTimeout(() => {
              setLoading(false);
              onSuccess?.();
            }, 1000);

          } catch (error: any) {
            console.error('💥 === PAYMENT VERIFICATION FAILED ===');
            console.error('Error details:', error);
            setLoading(false);
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support if the amount was deducted.",
              variant: "destructive"
            });
          }
        },
        modal: {
          ondismiss: function() {
            console.log('❌ Payment modal dismissed by user');
            setLoading(false);
          },
          escape: true,
          backdropclose: false
        }
      };

      console.log('🎯 Razorpay options:', razorpayOptions);

      if (!window.Razorpay) {
        throw new Error('Razorpay not properly loaded. Please refresh and try again.');
      }

      const paymentObject = new window.Razorpay(razorpayOptions);
      
      paymentObject.on('payment.failed', function (response: any) {
        console.error('💥 === RAZORPAY PAYMENT FAILED ===');
        console.error('Failure response:', response);
        setLoading(false);
        
        const errorMsg = response.error?.description || response.error?.reason || "Payment failed. Please try again.";
        toast({
          title: "Payment Failed",
          description: errorMsg,
          variant: "destructive"
        });
      });

      console.log('🚀 Opening Razorpay checkout...');
      paymentObject.open();
      
    } catch (error: any) {
      console.error('💥 === PAYMENT INITIALIZATION ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', error);
      
      setLoading(false);
      
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong. Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Pay ₹{amount} (Test Mode)
        </>
      )}
    </Button>
  );
};

export default PaymentButton;
