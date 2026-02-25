import React, { useState } from 'react';
import { ThemeConfig } from '../../types';
import { db } from '../../services/db';
import { ModalBase, ModalHeader, ModalContent } from './ModalBase';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeConfig;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  activeTheme
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const result = await db.forgotPassword(email.trim());
      
      if (result.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(result.message || "Failed to send password reset email");
      }
    } catch (e) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <ModalHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 pb-4 border-b border-blue-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
            <i className="fas fa-key text-xl text-blue-600"></i>
          </div>
          <h2 className="text-xl font-black text-slate-800">Forgot Password</h2>
        </div>
      </ModalHeader>
      <ModalContent className="p-6 space-y-4">
          {!success ? (
            <>
              <p className="text-sm text-center opacity-80">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all text-base font-bold text-slate-700 bg-white/50"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-xs font-bold bg-red-50 py-2 px-3 rounded-lg border border-red-100 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={!email.trim() || isLoading}
                  className={`w-full py-3 px-4 ${activeTheme.button} text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-circle-notch animate-spin"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-check text-2xl text-green-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-black mb-2">Check Your Email</h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  We've sent a password reset link to your email address. Please check your inbox and click the link to reset your password.
                </p>
                <p className="text-xs opacity-60 mt-3">
                  <i className="fas fa-clock mr-1"></i>
                  The link will expire in 1 hour.
                </p>
              </div>
              <button 
                onClick={handleClose}
                className={`w-full py-3 px-4 ${activeTheme.button} text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95`}
              >
                <i className="fas fa-check"></i>
                Got it
              </button>
            </div>
          )}
      </ModalContent>
    </ModalBase>
  );
};

