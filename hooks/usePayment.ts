import { useState, useEffect, useRef } from 'react';
import { PaymentStatus } from '../types/payment';

interface UsePaymentProps {
  onPaymentSuccess: (hints: number, paymentId: number) => void;
  playSfx: (type: 'pay') => void;
}

export const usePayment = ({ onPaymentSuccess, playSfx }: UsePaymentProps) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalConfig, setPaymentModalConfig] = useState<{title?: string, description?: string}>({});

  // Ensure payment success logic runs only once per payment session
  const hasVerifiedRef = useRef(false);
  // Incrementing ID to uniquely identify each payment attempt
  const paymentIdRef = useRef(0);

  const handlePayment = () => {
    // Reset verification flag for a new payment
    hasVerifiedRef.current = false;
    // Bump payment ID for this new attempt
    paymentIdRef.current += 1;
    setPaymentStatus('processing');

    // UPI Configuration
    const upiId = 'mauryavishal93-1@okaxis';
    const payeeName = 'Vishal Maurya';
    const aid = 'uGICAgIDA3qHVVA';
    const transactionNote = '100 Hints Pack';
    const amount = '9.00';
    const currency = 'INR';

    // Construct UPI Deep Link
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&aid=${aid}&tn=${encodeURIComponent(transactionNote)}&am=${amount}&cu=${currency}`;

    // Attempt to open UPI app
    setTimeout(() => {
        window.location.href = upiUrl;
    }, 1000);
  };

  // Listen for app return to trigger simulated verification
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        paymentStatus === 'processing' &&
        !hasVerifiedRef.current
      ) {
         // Guard to prevent duplicate verification / purchases
         hasVerifiedRef.current = true;
         setPaymentStatus('verifying');
         
         // Simulate network verification (Auto-Success)
         setTimeout(() => {
             playSfx('pay');
            onPaymentSuccess(100, paymentIdRef.current);
             setPaymentStatus('idle');
             setShowPaymentModal(false);
         }, 3000);
      }
    };

    if (paymentStatus === 'processing') {
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [paymentStatus, onPaymentSuccess, playSfx]);

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

  return {
    paymentStatus,
    showPaymentModal,
    paymentModalConfig,
    handlePayment,
    handleCancelPayment,
    openPaymentModal,
    closePaymentModal
  };
};

