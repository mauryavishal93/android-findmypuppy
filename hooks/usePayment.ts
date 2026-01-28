import { useState, useRef } from 'react';
import { PaymentStatus } from '../types/payment';
import { API_BASE_URL, PriceOffer } from '../services/db';
import { initializeRazorpayPayment } from '../services/razorpayService';
import { PaymentResultType } from '../components/modals/PaymentResultModal';

interface UsePaymentProps {
  onPaymentSuccess: (hints: number, paymentId: string, amount: number) => void;
  playSfx: (type: 'pay') => void;
  priceOffer: PriceOffer | null;
  playerName: string;
  playerEmail: string;
}

export const usePayment = ({ 
  onPaymentSuccess, 
  playSfx, 
  priceOffer,
  playerName,
  playerEmail
}: UsePaymentProps) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalConfig, setPaymentModalConfig] = useState<{title?: string, description?: string}>({});
  const [paymentResult, setPaymentResult] = useState<{
    type: PaymentResultType | null;
    message?: string;
    errorCode?: string;
  }>({ type: null });

  const handlePayment = async () => {
    setPaymentStatus('processing');

    const offerPrice = priceOffer?.offerPrice || 9.0;
    const hintPack = priceOffer?.hintPack || '100 Hints Pack';
    const hintCount = priceOffer?.hintCount || 100;

    try {
      await initializeRazorpayPayment({
        amount: offerPrice,
        playerName,
        playerEmail,
        packName: hintPack,
        hintsCount: hintCount,
        onSuccess: async (response) => {
         setPaymentStatus('verifying');
         
          try {
            const verifyUrl = API_BASE_URL ? `${API_BASE_URL}/api/razorpay/verify-payment` : '/api/razorpay/verify-payment';
            const verifyResponse = await fetch(verifyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                username: playerName,
                pack: hintPack,
                hintsToAdd: hintCount,
                amount: offerPrice
              })
            });

            const contentType = verifyResponse.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
              const text = await verifyResponse.text();
              const snippet = text.slice(0, 160).replace(/\s+/g, ' ').trim();
              throw new Error(
                `Payment verification API returned non-JSON (HTTP ${verifyResponse.status}). ` +
                `Response starts with: "${snippet}"`
              );
            }
            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              playSfx('pay');
              onPaymentSuccess(hintCount, response.razorpay_payment_id, offerPrice);
              setPaymentStatus('idle');
              setShowPaymentModal(false);
              // Show success popup
              setPaymentResult({
                type: 'success',
                message: `Successfully purchased ${hintCount} hints! Your account has been updated.`
              });
            } else {
              // Verification failed
              setPaymentStatus('idle');
              setShowPaymentModal(false);
              setPaymentResult({
                type: 'failed',
                message: verifyData.message || 'Payment verification failed. Please contact support if you were charged.',
                errorCode: verifyData.errorCode
              });
            }
          } catch (error: any) {
            console.error('Verification Error:', error);
            setPaymentStatus('idle');
            setShowPaymentModal(false);
            setPaymentResult({
              type: 'failed',
              message: 'Failed to verify payment. Please contact support if you were charged.',
              errorCode: error?.code || 'VERIFICATION_ERROR'
            });
          }
        },
        onError: (error: any) => {
          setPaymentStatus('idle');
          setShowPaymentModal(false);
          
          // Determine error type and message
          let resultType: PaymentResultType = 'failed';
          let errorMessage = 'Payment could not be completed.';
          let errorCode = error?.code || error?.type || 'UNKNOWN_ERROR';
          
          if (error?.type === 'cancelled') {
            resultType = 'cancelled';
            errorMessage = 'You cancelled the payment. No charges were made.';
          } else if (error?.type === 'failed') {
            resultType = 'failed';
            errorMessage = error?.description || error?.message || 'Your payment failed. Please try again.';
            errorCode = error?.code || 'PAYMENT_FAILED';
          } else if (error?.code === 'BAD_REQUEST_ERROR' || error?.code === 'GATEWAY_ERROR') {
            resultType = 'declined';
            errorMessage = error?.description || 'Your payment was declined. Please check your payment method.';
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          setPaymentResult({
            type: resultType,
            message: errorMessage,
            errorCode
          });
          
          console.log('Payment process ended:', error?.type || error?.code || 'unknown');
        }
      });
    } catch (error: any) {
      console.error('Razorpay Initialization Error:', error);
      setPaymentStatus('idle');
      setShowPaymentModal(false);
      setPaymentResult({
        type: 'failed',
        message: error?.message || 'Failed to initialize payment. Please try again.',
        errorCode: error?.code || 'INIT_ERROR'
      });
    }
  };

  const handleCancelPayment = () => {
    setPaymentStatus('idle');
  };

  const openPaymentModal = (config?: {title?: string, description?: string}) => {
    setPaymentModalConfig(config || {});
    setPaymentStatus('idle');
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentStatus('idle');
  };

  const closePaymentResult = () => {
    setPaymentResult({ type: null });
  };

  return {
    paymentStatus,
    showPaymentModal,
    paymentModalConfig,
    paymentResult,
    handlePayment,
    handleCancelPayment,
    openPaymentModal,
    closePaymentModal,
    closePaymentResult
  };
};

