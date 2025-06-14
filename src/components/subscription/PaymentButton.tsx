
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
        console.log('Razorpay already loaded');
        resolve(true);
        return;
      }

      console.log('Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = (error) => {
        console.error('Failed to load Razorpay script:', error);
        resolve(false);
      };
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
    console.log('=== PAYMENT PROCESS STARTED ===');

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway. Please check your internet connection and try again.');
      }

      console.log('=== CREATING ORDER ===');
      
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { plan, billingCycle }
      });

      console.log('Order response:', { orderData, orderError });

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Order creation failed: ${orderError.message || 'Unknown error'}`);
      }

      if (!orderData?.order || !orderData?.key) {
        console.error('Invalid order data:', orderData);
        throw new Error('Invalid order data received from server');
      }

      console.log('Order created successfully:', orderData.order.id);
      console.log('Using Razorpay mode:', orderData.mode);
      console.log('=== OPENING RAZORPAY CHECKOUT ===');

      const options = {
        key: orderData.key, // Dynamic key from backend
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
          console.log('=== PAYMENT COMPLETED ===');
          console.log('Payment response:', response);
          
          try {
            console.log('=== VERIFYING PAYMENT ===');
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

            console.log('Verification response:', { verifyData, verifyError });

            if (verifyError) {
              console.error('Payment verification error:', verifyError);
              throw new Error(`Payment verification failed: ${verifyError.message || 'Unknown error'}`);
            }

            if (!verifyData?.success) {
              console.error('Payment verification returned false');
              throw new Error('Payment verification failed - invalid signature');
            }

            console.log('=== PAYMENT VERIFIED SUCCESSFULLY ===');

            toast({
              title: "Payment Successful!",
              description: "Your subscription has been activated.",
            });

            setTimeout(() => {
              setLoading(false);
              onSuccess?.();
            }, 1000);

          } catch (error: any) {
            console.error('=== PAYMENT VERIFICATION FAILED ===');
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
            console.log('=== PAYMENT MODAL DISMISSED ===');
            setLoading(false);
          },
          escape: true,
          backdropclose: false
        }
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay not loaded properly. Please refresh the page and try again.');
      }

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        console.error('=== RAZORPAY PAYMENT FAILED ===');
        console.error('Payment failure response:', response);
        setLoading(false);
        
        const errorMsg = response.error?.description || response.error?.reason || "Payment was not completed. Please try again.";
        toast({
          title: "Payment Failed",
          description: errorMsg,
          variant: "destructive"
        });
      });

      paymentObject.open();
      
    } catch (error: any) {
      console.error('=== PAYMENT INITIALIZATION ERROR ===');
      console.error('Error details:', error);
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
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </Button>
  );
};

export default PaymentButton;
