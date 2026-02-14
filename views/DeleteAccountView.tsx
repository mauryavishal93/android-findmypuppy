import React, { useState } from 'react';
import { GameLogo } from '../components/GameLogo';
import { Button } from '../components/ui/Button';
import { db } from '../services/db';
import { getIsAndroidNativeGoogleAvailable, signInWithGoogleNative } from '../services/nativeGoogleAuth';

interface DeleteAccountViewProps {
  onBack: () => void;
  onAccountDeleted: () => void;
}

export const DeleteAccountView: React.FC<DeleteAccountViewProps> = ({ onBack, onAccountDeleted }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const androidGoogleAvailable = getIsAndroidNativeGoogleAvailable();

  const handleDeleteWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      setError('Please type DELETE exactly to confirm');
      return;
    }

    setIsLoading(true);

    try {
      const result = await db.deleteAccount(username.trim(), password);
      if (result.success) {
        setSuccessMsg('Your account has been permanently deleted.');
        // Clear local progress and tokens
        localStorage.removeItem('findMyPuppy_progress');
        localStorage.removeItem('findMyPuppy_token');
        setTimeout(() => onAccountDeleted(), 1500);
      } else {
        setError(result.message || 'Failed to delete account');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWithGoogle = async () => {
    setError(null);
    if (confirmText.toUpperCase() !== 'DELETE') {
      setError('Please type DELETE below to confirm deletion');
      return;
    }

    setIsLoading(true);

    try {
      const user = await signInWithGoogleNative();
      const { idToken } = user;
      const result = await db.deleteAccountWithGoogle(idToken);
      if (result.success) {
        setSuccessMsg('Your account has been permanently deleted.');
        localStorage.removeItem('findMyPuppy_progress');
        localStorage.removeItem('findMyPuppy_token');
        setTimeout(() => onAccountDeleted(), 1500);
      } else {
        setError(result.message || 'Failed to delete account');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Google sign-in failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="mobile-main-content flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 min-h-full">
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl w-full max-w-sm text-center border border-white/60">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-green-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">Account Deleted</h2>
          <p className="text-slate-600 text-sm">{successMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-main-content flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 min-h-full relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-rose-200/30 blur-[100px] rounded-full mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[50%] bg-amber-200/30 blur-[100px] rounded-full mix-blend-multiply animate-pulse"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl w-full max-w-sm z-10 border border-white/60 relative overflow-hidden max-h-[90vh] flex flex-col">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs transition-colors z-20 group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
            <i className="fas fa-arrow-left"></i>
          </div>
          <span>Back</span>
        </button>

        <div className="mx-auto mb-4 flex flex-col items-center shrink-0 pt-2">
          <div className="relative mb-2">
            <GameLogo className="w-14 h-14 relative z-10 drop-shadow-md" />
          </div>
          <h1 className="text-lg font-black text-slate-800">Delete Account</h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">
            Permanently remove your account and data
          </p>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar -mx-2 px-2 space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-left">
            <p className="text-xs text-rose-800 font-medium">
              <i className="fas fa-exclamation-triangle text-rose-500 mr-2"></i>
              This action cannot be undone. All your progress, hints, points, and purchase history will be permanently deleted.
            </p>
          </div>

          <form onSubmit={handleDeleteWithPassword} className="space-y-4">
            <div>
              <label className="block text-left text-xs font-bold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-sm font-medium"
                autoComplete="username"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-left text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all text-sm font-medium"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-left text-xs font-bold text-slate-700 mb-1">
                Type <span className="font-mono bg-slate-100 px-1 rounded">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-sm font-medium uppercase"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-rose-100 border border-rose-200 rounded-xl p-3 text-rose-800 text-xs font-medium flex items-center gap-2">
                <i className="fas fa-exclamation-circle flex-shrink-0"></i>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-black text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  Deleting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-trash-alt"></i>
                  Delete my account permanently
                </span>
              )}
            </Button>
          </form>

          {androidGoogleAvailable && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-600 font-medium mb-3 text-center">
                Signed up with Google?
              </p>
              <Button
                type="button"
                onClick={handleDeleteWithGoogle}
                disabled={isLoading}
                className="w-full border-2 border-slate-300 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 bg-white"
              >
                <span className="flex items-center justify-center gap-2">
                  <i className="fab fa-google text-rose-500"></i>
                  Verify with Google & Delete
                </span>
              </Button>
            </div>
          )}

          <p className="text-[10px] text-slate-500 text-center">
            Need help? Contact us at findmypuppys@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};
