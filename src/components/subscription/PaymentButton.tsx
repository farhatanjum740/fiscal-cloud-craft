
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
    // Check for browser compatibility
    const userAgent = navigator.userAgent.toLowerCase();
    const isFirefox = userAgent.includes('firefox');
    const isChrome = userAgent.includes('chrome');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    
    return isChrome || isFirefox || isSafari;
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      // Check if Razorpay is already loaded
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

    // Add updated Content Security Policy that includes Supabase functions
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = `default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://dfgjccuvsggfrxwharkp.supabase.co;`;
    document.head.appendChild(cspMeta);
    console.log('CSP meta tag updated for Razorpay and Supabase compatibility');
  };

  const handlePaymentError = (error: any, context: string) => {
    console.error(`=== PAYMENT ERROR IN ${context} ===`);
    console.error('Error details:', error);
    
    // Handle specific error types
    if (error.message && error.message.includes('unsafe header')) {
      console.warn('CORS header warning detected - this is usually safe to ignore');
      return; // Don't show error to user for CORS warnings
    }
    
    setLoading(false);
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

    // Check browser compatibility
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
      // Create order with enhanced error handling
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: { plan, billingCycle }
        }
      );

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
        config: {
          display: {
            hide: [
              {
                method: 'wallet'
              }
            ],
            preferences: {
              show_default_blocks: true,
            }
          }
        },
        handler: async function (response: any) {
          console.log('=== PAYMENT COMPLETED ===');
          console.log('Payment response:', response);
          
          // Suppress CORS warnings during verification
          const originalConsoleWarn = console.warn;
          console.warn = (message: any, ...args: any[]) => {
            if (typeof message === 'string' && message.includes('unsafe header')) {
              return; // Suppress CORS warnings
            }
            originalConsoleWarn(message, ...args);
          };
          
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

            // Call success callback after a short delay to ensure toast is shown
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
          } finally {
            // Restore original console.warn
            console.warn = originalConsoleWarn;
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

      // Ensure Razorpay is available
      if (!window.Razorpay) {
        throw new Error('Razorpay not loaded properly. Please refresh the page and try again.');
      }

      // Create Razorpay instance with enhanced error handling
      let paymentObject;
      try {
        paymentObject = new window.Razorpay(options);
      } catch (razorpayError: any) {
        console.error('Error creating Razorpay instance:', razorpayError);
        throw new Error('Failed to initialize payment gateway. Please try again.');
      }
      
      // Add comprehensive error handlers
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

      // Add network error handler
      paymentObject.on('payment.error', function (response: any) {
        console.error('=== RAZORPAY PAYMENT ERROR ===');
        console.error('Payment error response:', response);
        handlePaymentError(response, 'Payment Processing');
      });

      // Add modal error handler
      paymentObject.on('modal.error', function (response: any) {
        console.error('=== RAZORPAY MODAL ERROR ===');
        console.error('Modal error response:', response);
        handlePaymentError(response, 'Payment Modal');
      });

      // Suppress CORS warnings before opening modal
      const originalConsoleError = console.error;
      console.error = (message: any, ...args: any[]) => {
        if (typeof message === 'string' && message.includes('unsafe header')) {
          return; // Suppress CORS warnings
        }
        originalConsoleError(message, ...args);
      };

      try {
        paymentObject.open();
      } finally {
        // Restore original console.error after a delay
        setTimeout(() => {
          console.error = originalConsoleError;
        }, 5000);
      }
      
    } catch (error: any) {
      console.error('=== PAYMENT INITIALIZATION ERROR ===');
      console.error('Error details:', error);
      
      // Handle specific error types
      if (error.message && error.message.includes('unsafe header')) {
        console.warn('CORS header warning detected - attempting to continue with payment...');
        return; // Don't show error for CORS warnings
      }
      
      setLoading(false);
      
      // Provide retry option for certain errors
      if (retryCount < 2 && (error.message.includes('script') || error.message.includes('network'))) {
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
