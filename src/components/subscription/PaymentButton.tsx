
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to continue",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Starting payment process for:', { plan, billingCycle, amount });

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway. Please try again.');
      }

      console.log('Razorpay script loaded successfully');

      // Create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: { plan, billingCycle }
        }
      );

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(orderError.message || 'Failed to create payment order');
      }

      if (!orderData?.order) {
        throw new Error('Invalid order data received');
      }

      console.log('Order created successfully:', orderData.order.id);

      const options = {
        key: process.env.NODE_ENV === 'production' ? 'rzp_live_07WptSc4WNqInm' : 'rzp_test_07WptSc4WNqInm',
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'InvoiceHub',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${billingCycle}`,
        order_id: orderData.order.id,
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#0d2252'
        },
        handler: async function (response: any) {
          console.log('Payment completed, verifying...', response);
          setLoading(true);
          
          try {
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

            if (verifyError) {
              console.error('Payment verification error:', verifyError);
              throw new Error(verifyError.message || 'Payment verification failed');
            }

            if (!verifyData?.success) {
              throw new Error('Payment verification failed');
            }

            console.log('Payment verified successfully');

            toast({
              title: "Payment Successful!",
              description: "Your subscription has been activated.",
            });

            // Call success callback after a short delay to ensure toast is shown
            setTimeout(() => {
              onSuccess?.();
            }, 1000);

          } catch (error: any) {
            console.error('Payment verification failed:', error);
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support if the amount was deducted.",
              variant: "destructive"
            });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setLoading(false);
          },
          confirm_close: true,
          escape: true
        }
      };

      console.log('Opening Razorpay checkout with options:', options);
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </Button>
  );
};

export default PaymentButton;
