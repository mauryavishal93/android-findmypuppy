import React from 'react';
import { Button } from '../ui/Button';

export type PaymentResultType = 'success' | 'failed' | 'cancelled' | 'declined';

export interface PaymentResultModalProps {
  result: PaymentResultType;
  message?: string;
  errorCode?: string;
  onClose: () => void;
}

export const PaymentResultModal: React.FC<PaymentResultModalProps> = ({
  result,
  message,
  errorCode,
  onClose
}) => {
  const getResultConfig = () => {
    switch (result) {
      case 'success':
        return {
          icon: 'fa-check-circle',
          iconBg: 'from-green-400 to-emerald-600',
          title: 'Payment Successful! 🎉',
          defaultMessage: 'Your hints have been added to your account!',
          borderColor: 'border-green-200',
          textColor: 'text-green-600',
          bgPattern: 'bg-green-50',
        };
      case 'failed':
        return {
          icon: 'fa-times-circle',
          iconBg: 'from-red-400 to-rose-600',
          title: 'Payment Failed',
          defaultMessage: message || 'Your payment could not be processed. Please try again.',
          borderColor: 'border-red-200',
          textColor: 'text-red-600',
          bgPattern: 'bg-red-50',
        };
      case 'declined':
        return {
          icon: 'fa-ban',
          iconBg: 'from-orange-400 to-amber-600',
          title: 'Payment Declined',
          defaultMessage: message || 'Your payment was declined by the bank. Please check your payment method.',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-600',
          bgPattern: 'bg-orange-50',
        };
      case 'cancelled':
        return {
          icon: 'fa-times',
          iconBg: 'from-slate-400 to-gray-600',
          title: 'Payment Cancelled',
          defaultMessage: 'You cancelled the payment. No charges were made.',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-600',
          bgPattern: 'bg-slate-50',
        };
      default:
        return {
          icon: 'fa-exclamation-circle',
          iconBg: 'from-slate-400 to-gray-600',
          title: 'Payment Error',
          defaultMessage: 'An unexpected error occurred.',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-600',
          bgPattern: 'bg-slate-50',
        };
    }
  };

  const config = getResultConfig();
  const displayMessage = message || config.defaultMessage;

  return (
    <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className={`bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl relative border-4 ${config.borderColor} overflow-hidden flex flex-col items-center animate-fade-in`}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute animate-pulse" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${10 + Math.random() * 20}px`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}>
              {result === 'success' ? (
                <i className="fas fa-check text-green-500"></i>
              ) : (
                <i className="fas fa-times text-red-500"></i>
              )}
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Icon - Top Center */}
          <div className={`w-28 h-28 bg-gradient-to-br ${config.iconBg} rounded-full flex items-center justify-center shadow-2xl border-4 border-white mb-6 ${
            result === 'success' ? 'animate-bounce-short' : 'animate-pulse'
          }`}>
            <i className={`fas ${config.icon} text-6xl text-white drop-shadow-lg`}></i>
          </div>

          {/* Title */}
          <h2 className={`text-4xl font-black mb-3 bg-gradient-to-r ${config.iconBg} bg-clip-text text-transparent`}>
            {config.title}
          </h2>

          {/* Message */}
          <div className={`mb-6 space-y-2 w-full ${config.bgPattern} rounded-xl p-4 border-2 ${config.borderColor}`}>
            <p className={`${config.textColor} font-bold text-lg`}>
              {displayMessage}
            </p>
            {errorCode && (
              <p className="text-slate-400 text-xs font-medium mt-2">
                Error Code: {errorCode}
              </p>
            )}
            {result === 'success' && (
              <p className="text-green-600 text-sm font-medium mt-2 flex items-center justify-center gap-2">
                <i className="fas fa-lightbulb"></i>
                Your hints are ready to use!
              </p>
            )}
            {(result === 'failed' || result === 'declined') && (
              <div className="text-slate-500 text-xs italic mt-3 space-y-1">
                <p>💡 Tips:</p>
                <p>• Check your internet connection</p>
                <p>• Verify your payment method</p>
                <p>• Contact your bank if the issue persists</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-3 w-full">
            <Button 
              onClick={onClose} 
              className={`w-full ${
                result === 'success' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 hover:shadow-xl' 
                  : result === 'cancelled'
                  ? 'bg-gradient-to-r from-slate-500 to-gray-600 text-white shadow-lg shadow-slate-200 hover:shadow-xl'
                  : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200 hover:shadow-xl'
              } transition-all`}
            >
              {result === 'success' ? (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Awesome! Let's Play
                </>
              ) : result === 'cancelled' ? (
                <>
                  <i className="fas fa-arrow-left mr-2"></i>
                  Go Back
                </>
              ) : (
                <>
                  <i className="fas fa-redo mr-2"></i>
                  Try Again
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

