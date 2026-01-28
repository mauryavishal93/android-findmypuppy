
import { Capacitor, registerPlugin } from '@capacitor/core';
import { API_BASE_URL } from './db';

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const apiUrl = (path: string) => (API_BASE_URL ? `${API_BASE_URL}${path}` : path);

async function readJsonOrThrow(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    const snippet = text.slice(0, 160).replace(/\s+/g, ' ').trim();
    throw new Error(
      `Server returned non-JSON response (HTTP ${response.status}). ` +
        `This usually means the API base URL is wrong in Android. Response starts with: "${snippet}"`
    );
  }
  return response.json();
}

// Native Razorpay plugin (Android)
interface RazorpayCheckoutPlugin {
  openCheckout(options: {
    key: string;
    orderId: string;
    amount: number;
    currency?: string;
    name?: string;
    description?: string;
    email?: string;
    contact?: string;
  }): Promise<{ paymentId: string; orderId: string; signature: string }>;
}

const RazorpayCheckout = registerPlugin<RazorpayCheckoutPlugin>('RazorpayCheckout');

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
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

export const initializeRazorpayPayment = async (options: {
  amount: number;
  playerName: string;
  playerEmail: string;
  packName: string;
  hintsCount: number;
  onSuccess: (response: RazorpayResponse) => void;
  onError: (error: any) => void;
}) => {
  try {
    // 1. Create order on the backend
    const orderResponse = await fetch(apiUrl('/api/razorpay/create-order'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: options.amount,
        receipt: `receipt_${Date.now()}`
      })
    });

    const orderData = await readJsonOrThrow(orderResponse);
    if (!orderData.success) {
      throw new Error(orderData.message || 'Failed to create order');
    }

    const orderId = orderData?.order?.id;
    const orderAmount = orderData?.order?.amount;
    const orderCurrency = orderData?.order?.currency || 'INR';

    if (!orderId || !orderAmount) {
      throw new Error('Invalid Razorpay order response from server.');
    }

    // Use native Razorpay SDK on Android (more reliable than web checkout.js in WebView)
    const isAndroidNative = (Capacitor.getPlatform?.() === 'android') && (Capacitor.isNativePlatform?.() ? Capacitor.isNativePlatform() : true);
    if (isAndroidNative) {
      try {
        // Razorpay Key: Use environment variable if available, otherwise fallback to test key
        // For production, set VITE_RAZORPAY_KEY_ID in environment variables
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RyzZQD56IABhEH';
        
        const nativeRes = await RazorpayCheckout.openCheckout({
          key: razorpayKey,
          orderId,
          amount: orderAmount,
          currency: orderCurrency,
          name: 'Find My Puppy',
          description: `Purchase ${options.packName}`,
          email: options.playerEmail,
          contact: ''
        });

        options.onSuccess({
          razorpay_order_id: nativeRes.orderId,
          razorpay_payment_id: nativeRes.paymentId,
          razorpay_signature: nativeRes.signature
        });
        return;
      } catch (err: any) {
        options.onError({
          type: err?.message?.toLowerCase?.().includes('cancel') ? 'cancelled' : 'failed',
          description: err?.message || 'Payment failed on Android.',
          code: err?.code || err?.errorCode || 'NATIVE_RAZORPAY_ERROR'
        });
        return;
      }
    }

    // ---- Web checkout (browser) ----
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      options.onError(new Error('Razorpay SDK failed to load.'));
      return;
    }

    // Flag to track if payment was already handled by success/fail events
    let isHandled = false;

    // 2. Open Razorpay Checkout
    // Razorpay Key: Use environment variable if available, otherwise fallback to test key
    // For production, set VITE_RAZORPAY_KEY_ID in environment variables
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RyzZQD56IABhEH';
    
    const razorpayOptions = {
      key: razorpayKey,
      amount: orderAmount,
      currency: orderCurrency,
      name: 'Find My Puppy',
      description: `Purchase ${options.packName}`,
      image: 'https://raw.githubusercontent.com/mauryavishal93/FindMyPuppy/main/apk/release/icon.png',
      order_id: orderId,
      handler: function (response: RazorpayResponse) {
        isHandled = true;
        options.onSuccess(response);
      },
      prefill: {
        name: options.playerName,
        email: options.playerEmail
      },
      theme: {
        color: '#FF69B4'
      },
      modal: {
        ondismiss: function() {
          if (!isHandled) {
            isHandled = true;
            options.onError({
              type: 'cancelled',
              description: 'Payment cancelled'
            });
          }
        }
      }
    };

    const rzp = new (window as any).Razorpay(razorpayOptions);
    
    // Handle payment failure (Decline/Reject)
    rzp.on('payment.failed', function (response: any) {
      isHandled = true;
      options.onError({
        type: 'failed',
        description: response?.error?.description || response?.error?.reason || 'Payment failed',
        code: response?.error?.code || response?.error?.reason || 'PAYMENT_FAILED'
      });
    });

    rzp.open();

  } catch (error) {
    options.onError(error);
  }
};

