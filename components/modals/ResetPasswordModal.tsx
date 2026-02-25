import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../../types';
import { db } from '../../services/db';
import { ModalBase, ModalHeader, ModalContent } from './ModalBase';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeConfig;
  token: string;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  token,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset token");
    }
  }, [token]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await db.resetPassword(token, newPassword);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(result.message || "Failed to reset password");
      }
    } catch (e) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <ModalHeader className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 pb-4 border-b border-green-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
            <i className="fas fa-lock text-xl text-green-600"></i>
          </div>
          <h2 className="text-xl font-black text-slate-800">Reset Password</h2>
        </div>
      </ModalHeader>
      <ModalContent className="p-6 space-y-4">
          {!success ? (
            <>
              <p className="text-sm text-center opacity-80">
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all text-base font-bold text-slate-700 bg-white/50"
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>

                <div className="relative">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all text-base font-bold text-slate-700 bg-white/50"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>

                {error && (
                  <div className="text-red-500 text-xs font-bold bg-red-50 py-2 px-3 rounded-lg border border-red-100 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={!newPassword.trim() || !confirmPassword.trim() || isLoading}
                  className={`w-full py-3 px-4 ${activeTheme.button} text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-circle-notch animate-spin"></i>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Reset Password
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
                <h3 className="text-lg font-black mb-2">Password Reset Successful!</h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  Your password has been reset successfully. You can now login with your new password.
                </p>
              </div>
              <button 
                onClick={onSuccess}
                className={`w-full py-3 px-4 ${activeTheme.button} text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95`}
              >
                <i className="fas fa-sign-in-alt"></i>
                Go to Login
              </button>
            </div>
          )}
      </ModalContent>
    </ModalBase>
  );
};

