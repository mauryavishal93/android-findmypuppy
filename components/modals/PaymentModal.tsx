import React from 'react';
import { PaymentStatus } from '../../types/payment';
import { PriceOffer } from '../../services/db';

interface PaymentModalProps {
  onClose: () => void;
  onPay: () => void;
  onPayWithPoints: () => void;
  currentPoints: number;
  paymentStatus: PaymentStatus;
  onCancelPayment: () => void;
  title?: string;
  description?: string;
  priceOffer: PriceOffer | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  onClose, 
  onPay, 
  onPayWithPoints, 
  currentPoints, 
  paymentStatus, 
  onCancelPayment,
  title,
  description,
  priceOffer
}) => {
  // Use price offer values if available, otherwise fallback to defaults
  const marketPrice = priceOffer?.marketPrice || 99;
  const offerPrice = priceOffer?.offerPrice || 9;
  const hintCount = priceOffer?.hintCount || 100;
  const offerReason = priceOffer?.offerReason || 'Special Offer';
  const hasOffer = marketPrice !== offerPrice;
  
  // Calculate discount percentage
  const discountPercent = hasOffer ? Math.round(((marketPrice - offerPrice) / marketPrice) * 100) : 0;
  
  if (paymentStatus === 'processing' || paymentStatus === 'verifying') {
    return (
      <div className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 w-full max-w-xs text-center shadow-2xl animate-fade-in mx-4">
           <div className="animate-spin text-4xl text-brand mb-4 mx-auto w-min"><i className="fas fa-circle-notch"></i></div>
           <h3 className="text-xl font-bold text-slate-800 mb-2">
             {paymentStatus === 'verifying' ? 'Verifying...' : 'Processing...'}
           </h3>
           <p className="text-sm text-slate-500 mb-6">
             {paymentStatus === 'verifying' 
               ? 'Confirming payment status.' 
               : 'Redirecting to UPI app...'}
           </p>
           {paymentStatus === 'processing' && (
             <button onClick={onCancelPayment} className="text-slate-400 font-bold text-xs uppercase tracking-wider hover:text-slate-600">
               Cancel
             </button>
           )}
        </div>
      </div>
    );
  }

  // Idle State
  return (
    <div className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl relative mx-4 max-h-[90vh] overflow-y-auto overflow-x-hidden hide-scrollbar">
        <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4 shrink-0">
           <i className="fas fa-lightbulb text-3xl text-brand-dark animate-bounce-short"></i>
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-1">{title || "Need a Hint?"}</h3>
        <p className="text-slate-500 text-sm mb-6 font-medium">
          {description || "You're out of free hints for this level."}
        </p>

        {/* Pay with Points */}
        <div className="bg-indigo-50 rounded-2xl p-4 mb-4 border border-indigo-100 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
             <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Use Points</span>
             <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm">
               <i className="fas fa-trophy text-yellow-500 text-xs"></i>
               <span className="text-indigo-900 font-black text-xs">{currentPoints}</span>
             </div>
          </div>
          
          <button 
            onClick={onPayWithPoints}
            disabled={currentPoints < 10}
            className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            <div className="flex flex-col items-start leading-none">
               <span className="text-[10px] opacity-80 font-medium">Pay 10 Points</span>
               <span className="text-sm">Get 2 Hints</span>
            </div>
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </button>
          {currentPoints < 10 && (
             <p className="text-[10px] text-red-500 mt-2 font-bold flex items-center justify-center gap-1">
               <i className="fas fa-lock"></i> Not enough points
             </p>
          )}
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-300 text-[10px] font-bold uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>
        
        {/* Pay Money */}
        <button 
          onClick={onPay}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-yellow-200 hover:scale-105 transition-transform mb-3 flex items-center justify-between px-4 relative overflow-hidden"
        >
          {/* Tag - only show if there's an offer */}
          {hasOffer && discountPercent > 0 && (
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
              {discountPercent}% OFF
            </div>
          )}

          <div className="flex flex-col items-start leading-none">
             {hasOffer && (
               <span className="text-[10px] opacity-90 font-bold text-yellow-50 mb-0.5 uppercase tracking-wide">{offerReason}</span>
             )}
             <div className="flex items-center gap-2">
               {hasOffer ? (
                 <>
                   <span className="text-[10px] text-yellow-200/80 line-through decoration-red-500/80 decoration-2 font-medium">₹{marketPrice}</span>
                   <span className="text-2xl font-black drop-shadow-sm">₹{offerPrice}</span>
                 </>
               ) : (
                 <span className="text-2xl font-black drop-shadow-sm">₹{offerPrice}</span>
               )}
             </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] opacity-90">Get</div>
             <div className="font-black text-lg leading-none">+{hintCount} Hints</div>
          </div>
        </button>
        
        <button 
          onClick={onClose}
          className="text-slate-400 text-xs font-bold hover:text-slate-600 uppercase tracking-wide py-2"
        >
          No thanks
        </button>
      </div>
    </div>
  );
};

