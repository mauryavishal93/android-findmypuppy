import React from 'react';
import { ThemeConfig } from '../../types';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

interface ReferFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeConfig;
  playerName: string;
}

export const ReferFriendModal: React.FC<ReferFriendModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  playerName
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showAppSelector, setShowAppSelector] = React.useState(false);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const referralCode = `${playerName}${currentYear}`;
  const referralLink = `https://findmypuppy.onrender.com/?ref=${referralCode}`;

  const referralMessage = `🐶🌍 *Magical Puppy Referral* 🐾

I've discovered a world of hidden puppies at *Find My Puppy*! 🐕✨ 
Come join the adventure with me!

🎁 *Your Welcome Gift:* 
Sign up using my link or code below to instantly unlock *25 BONUS HINTS*! 

🔗 *Join here:* ${referralLink}
🎫 *Referral Code:* ${referralCode}

Let's see who can find the puppies faster! 🐶🌍`;

  const handleCopyLink = (silent: any = false) => {
    // If silent is an event object (from onClick), treat it as false
    const isSilent = typeof silent === 'boolean' ? silent : false;

    // Robust copy function for both Web and Mobile/WebViews
    const copyToClipboard = (text: string) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      
      return new Promise<void>((resolve, reject) => {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          textArea.style.top = "0";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (successful) resolve();
          else reject(new Error('Copy command failed'));
        } catch (err) {
          reject(err);
        }
      });
    };

    return copyToClipboard(referralMessage)
      .then(() => {
        if (!isSilent) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const shareToApp = (app: 'whatsapp' | 'telegram' | 'email') => {
    const encodedMessage = encodeURIComponent(referralMessage);
    const encodedSubject = encodeURIComponent('Join me on Find My Puppy! 🐕✨');
    
    let url = '';
    switch (app) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedMessage}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodedMessage}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodedSubject}&body=${encodedMessage}`;
        break;
    }
    
    if (url) window.open(url, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Find My Puppy Referral',
      text: referralMessage
      // url removed - link is already included in referralMessage text
    };

    try {
      // 1. Native Platform (Capacitor)
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: shareData.title,
          text: shareData.text,
          dialogTitle: 'Share with Friends'
        });
        return;
      }

      // 2. Web Share API (Works on most mobile browsers and modern Desktop OS)
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      // 3. Fallback for Desktop/PC: Show the selector instead of alert
      setShowAppSelector(true);
      
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
        setShowAppSelector(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-[320px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50 animate-pop-in ${activeTheme.cardBg} ${activeTheme.text}`}>
        
        {/* Header */}
        <div className="p-4 text-center border-b border-white/10 relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 w-7 h-7 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
          
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
            <i className="fas fa-user-plus text-xl"></i>
          </div>
          <h2 className="text-xl font-black">Refer a Friend</h2>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="bg-white/10 rounded-xl p-3 text-[11px] leading-relaxed font-medium max-h-[200px] overflow-y-auto hide-scrollbar">
            <p className="mb-2">🐶🌍 <span className="font-black italic text-brand">Magical Puppy Referral</span> 🐾</p>
            <p className="mb-2 font-black text-sm">Your Code: <span className="text-brand">{referralCode}</span></p>
            <p className="mb-2 italic opacity-80 underline select-all">{referralLink}</p>
            <p className="mb-2">I've discovered a world of hidden puppies at <span className="font-black italic">Find My Puppy</span>! 🐕✨ Come join the adventure with me!</p>
            <p className="mb-2 font-bold text-red-500">🎁 Your Welcome Gift: 25 BONUS HINTS!</p>
            <p className="mb-2">Invite your friends and you both earn <span className="font-black">25 Hints</span> when they join! Puppy hunting is better together! 🐾</p>
          </div>

          <div className="flex flex-col gap-2">
            {!showAppSelector ? (
              <>
                <button 
                  onClick={handleCopyLink}
                  className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border-2 relative ${
                    copied 
                      ? 'bg-green-500/20 border-green-500 text-green-600' 
                      : 'bg-white/20 border-white/30 hover:bg-white/30'
                  }`}
                >
                  <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                  {copied ? 'Copied!' : 'Copy Message'}
                  
                  {/* Tooltip */}
                  {copied && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-lg animate-bounce-short">
                      Text Copied!
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  )}
                </button>
                
                <button 
                  onClick={handleShare}
                  className={`w-full py-3 px-4 ${activeTheme.button} text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95`}
                >
                  <i className="fas fa-share-alt"></i>
                  Share with Friends
                </button>
              </>
            ) : (
              <div className="space-y-2 animate-fade-in">
                <p className="text-[10px] font-black uppercase tracking-widest text-center opacity-60 mb-2">Select App to Share</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => shareToApp('whatsapp')}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md">
                      <i className="fab fa-whatsapp text-xl"></i>
                    </div>
                    <span className="text-[10px] font-bold">WhatsApp</span>
                  </button>
                  <button 
                    onClick={() => shareToApp('telegram')}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-md">
                      <i className="fab fa-telegram-plane text-xl"></i>
                    </div>
                    <span className="text-[10px] font-bold">Telegram</span>
                  </button>
                  <button 
                    onClick={() => shareToApp('email')}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center shadow-md">
                      <i className="fas fa-envelope text-lg"></i>
                    </div>
                    <span className="text-[10px] font-bold">Email</span>
                  </button>
                </div>
                <button 
                  onClick={() => setShowAppSelector(false)}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100"
                >
                  <i className="fas fa-chevron-left mr-1"></i> Back
                </button>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-[10px] opacity-60 font-bold tracking-widest uppercase">
              Discover • Share • Find Puppies 🐕✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

