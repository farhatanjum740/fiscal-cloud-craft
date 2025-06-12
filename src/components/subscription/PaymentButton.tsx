
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
  const [retryCount, setRetryCount] = useState(0);

  const isBrowserSupported = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isFirefox = userAgent.includes('firefox');
    const isChrome = userAgent.includes('chrome');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    
    return isChrome || isFirefox || isSafari;
  };

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

  const createCSPMetaTag = () => {
    // Remove existing CSP meta tag if present
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP) {
      existingCSP.remove();
    }

    // Add comprehensive Content Security Policy that includes all required endpoints
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = `default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://dfgjccuvsggfrxwharkp.supabase.co https://*.supabase.co;`;
    document.head.appendChild(cspMeta);
    console.log('CSP meta tag updated with comprehensive permissions');
  };

  const handlePaymentError = (error: any, context: string) => {
    console.error(`=== PAYMENT ERROR IN ${context} ===`);
    console.error('Error details:', error);
    
    // Always ensure loading is set to false
    setLoading(false);
    
    // Handle specific error types
    if (error.message && error.message.includes('unsafe header')) {
      console.warn('CORS header warning detected - this is usually safe to ignore');
      return;
    }
    
    toast({
      title: "Payment Error",
      description: error.message || `Error in ${context}. Please try again.`,
      variant: "destructive"
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

    if (!isBrowserSupported()) {
      toast({
        title: "Browser Compatibility",
        description: "For the best payment experience, please use Chrome, Firefox, or Safari.",
        variant: "destructive"
      });
    }

    setLoading(true);
    console.log('=== PAYMENT PROCESS STARTED ===');
    console.log('User:', user.email);
    console.log('Plan:', plan, 'Billing:', billingCycle, 'Amount:', amount);
    console.log('Browser:', navigator.userAgent);

    try {
      // Update CSP meta tag for better compatibility
      createCSPMetaTag();

      // Load Razorpay script with retry mechanism
      let scriptLoaded = false;
      for (let i = 0; i < 3; i++) {
        scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded) break;
        console.log(`Script load attempt ${i + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway after multiple attempts. Please check your internet connection and try again.');
      }

      console.log('=== CREATING ORDER ===');
      
      // Create order with timeout and better error handling
      const { data: orderData, error: orderError } = await Promise.race([
        supabase.functions.invoke('create-razorpay-order', {
          body: { plan, billingCycle }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Order creation timeout')), 30000)
        )
      ]) as any;

      console.log('Order response:', { orderData, orderError });

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Order creation failed: ${orderError.message || 'Unknown error'}`);
      }

      if (!orderData?.order) {
        console.error('Invalid order data:', orderData);
        throw new Error('Invalid order data received from server');
      }

      console.log('Order created successfully:', orderData.order.id);
      console.log('=== OPENING RAZORPAY CHECKOUT ===');

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
          confirm_close: true,
          escape: true,
          animation: false,
          backdropclose: false
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300,
        remember_customer: false
      };

      console.log('Razorpay options configured with enhanced settings');

      if (!window.Razorpay) {
        throw new Error('Razorpay not loaded properly. Please refresh the page and try again.');
      }

      let paymentObject;
      try {
        paymentObject = new window.Razorpay(options);
      } catch (razorpayError: any) {
        console.error('Error creating Razorpay instance:', razorpayError);
        throw new Error('Failed to initialize payment gateway. Please try again.');
      }
      
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

      paymentObject.on('payment.error', function (response: any) {
        console.error('=== RAZORPAY PAYMENT ERROR ===');
        console.error('Payment error response:', response);
        handlePaymentError(response, 'Payment Processing');
      });

      paymentObject.on('modal.error', function (response: any) {
        console.error('=== RAZORPAY MODAL ERROR ===');
        console.error('Modal error response:', response);
        handlePaymentError(response, 'Payment Modal');
      });

      try {
        paymentObject.open();
      } catch (openError: any) {
        console.error('Error opening Razorpay modal:', openError);
        throw new Error('Failed to open payment gateway. Please try again.');
      }
      
    } catch (error: any) {
      console.error('=== PAYMENT INITIALIZATION ERROR ===');
      console.error('Error details:', error);
      
      // Always ensure loading is set to false
      setLoading(false);
      
      // Handle specific error types
      if (error.message && error.message.includes('unsafe header')) {
        console.warn('CORS header warning detected - attempting to continue with payment...');
        return;
      }
      
      // Provide retry option for certain errors
      if (retryCount < 2 && (error.message.includes('script') || error.message.includes('network') || error.message.includes('timeout'))) {
        setRetryCount(prev => prev + 1);
        toast({
          title: "Connection Issue",
          description: `Attempt ${retryCount + 1}/3 failed. Retrying automatically...`,
          variant: "destructive"
        });
        
        setTimeout(() => {
          handlePayment();
        }, 2000);
        return;
      }
      
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
