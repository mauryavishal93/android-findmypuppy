import React, { useState, useEffect } from 'react';
import { PurchaseHistory } from '../../services/db';
import { db } from '../../services/db';
import { ThemeConfig } from '../../types';

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
    <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-4 px-4 animate-fade-in overflow-hidden">
      <div className={`w-full max-w-md ${activeTheme.cardBg} rounded-3xl shadow-2xl border-2 border-white/50 overflow-hidden mt-8 mb-4 max-h-[85vh] flex flex-col`}>
        {/* Header */}
        <div className={`${activeTheme.headerBg} px-6 py-4 flex items-center justify-between border-b border-white/20`}>
          <h2 className={`text-xl font-black ${activeTheme.text} flex items-center gap-2`}>
            <i className="fas fa-history text-lg"></i>
            Buy History
          </h2>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors ${activeTheme.text}`}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 hide-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <i className={`fas fa-spinner fa-spin text-3xl ${activeTheme.text} opacity-50`}></i>
                <p className={`text-sm font-medium ${activeTheme.subText}`}>Loading purchase history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <i className={`fas fa-exclamation-circle text-4xl text-red-500`}></i>
                <p className={`text-sm font-medium ${activeTheme.text}`}>{error}</p>
              </div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <i className={`fas fa-shopping-bag text-4xl ${activeTheme.text} opacity-30`}></i>
                <p className={`text-sm font-medium ${activeTheme.subText}`}>No purchases yet</p>
                <p className={`text-xs ${activeTheme.subText} opacity-70`}>Your purchase history will appear here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.purchaseId}
                  className={`${activeTheme.cardBg} rounded-2xl p-4 border border-white/20 shadow-sm`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        purchase.purchaseType === 'Premium' 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                          : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      }`}>
                        <i className={`fas ${
                          purchase.purchaseType === 'Premium' 
                            ? 'fa-crown' 
                            : 'fa-lightbulb'
                        } text-white text-sm`}></i>
                      </div>
                      <div>
                        <h3 className={`font-black text-sm ${activeTheme.text}`}>
                          {purchase.purchaseType}
                        </h3>
                        <p className={`text-xs ${activeTheme.subText}`}>
                          {purchase.pack}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-sm ${activeTheme.text}`}>
                      {purchase.purchaseMode === 'Points'
                        ? `Pts ${purchase.amount}`
                        : `₹${purchase.amount.toFixed(2)}`}
                      </p>
                      <p className={`text-[10px] ${activeTheme.subText} opacity-70`}>
                        {formatDate(purchase.purchaseDate)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className={`text-[10px] font-mono ${activeTheme.subText} opacity-60`}>
                      ID: {purchase.purchaseId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`${activeTheme.headerBg} px-6 py-4 border-t border-white/20`}>
          <button
            onClick={onClose}
            className={`w-full ${activeTheme.button} text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition-all`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

