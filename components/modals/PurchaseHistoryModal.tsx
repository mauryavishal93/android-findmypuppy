import React, { useState, useEffect } from 'react';
import { PurchaseHistory } from '../../services/db';
import { db } from '../../services/db';
import { ThemeConfig } from '../../types';
import { ModalBase, ModalHeader, ModalContent, ModalFooter } from './ModalBase';

interface PurchaseHistoryModalProps {
  onClose: () => void;
  username: string;
  activeTheme: ThemeConfig;
}

export const PurchaseHistoryModal: React.FC<PurchaseHistoryModalProps> = ({ 
  onClose, 
  username,
  activeTheme 
}) => {
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      if (!username) {
        setError('Username not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await db.getPurchaseHistory(username);
        if (result.success && result.purchases) {
          setPurchases(result.purchases);
        } else {
          setError(result.message || 'Failed to load purchase history');
        }
      } catch (err) {
        setError('Failed to load purchase history');
        console.error('Purchase history fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, [username]);

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ModalBase isOpen={true} onClose={onClose} maxWidth="md">
      <ModalHeader className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 pb-4 border-b border-slate-200">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <i className="fas fa-history text-indigo-600"></i>
          Purchase History
        </h2>
      </ModalHeader>
      <ModalContent className="px-6 py-4 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <i className="fas fa-spinner fa-spin text-3xl text-slate-400"></i>
                <p className="text-sm font-medium text-slate-600">Loading purchase history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <i className="fas fa-exclamation-circle text-4xl text-red-500"></i>
                <p className="text-sm font-medium text-slate-700">{error}</p>
              </div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <i className="fas fa-shopping-bag text-4xl text-slate-300"></i>
                <p className="text-sm font-semibold text-slate-700">No purchases yet</p>
                <p className="text-xs text-slate-500">Your purchase history will appear here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.purchaseId}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                        purchase.purchaseType === 'Premium'
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                          : 'bg-gradient-to-br from-amber-400 to-orange-500'
                      }`}>
                        <i className={`fas ${
                          purchase.purchaseType === 'Premium'
                            ? 'fa-crown'
                            : 'fa-lightbulb'
                        } text-white text-base`}></i>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 text-sm leading-tight">
                          {purchase.purchaseType} · {purchase.pack}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDate(purchase.purchaseDate)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 truncate" title={purchase.purchaseId}>
                          {purchase.purchaseId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm ${
                        purchase.purchaseMode === 'Points'
                          ? 'text-indigo-600'
                          : 'text-emerald-600'
                      }`}>
                        {purchase.purchaseMode === 'Points'
                          ? `${purchase.amount} pts`
                          : `₹${purchase.amount.toFixed(2)}`}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {purchase.purchaseMode === 'Points' ? 'Points' : 'Paid'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </ModalContent>
      <ModalFooter className="px-6 py-4 border-t border-slate-200 bg-white">
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors"
        >
          Close
        </button>
      </ModalFooter>
    </ModalBase>
  );
};

