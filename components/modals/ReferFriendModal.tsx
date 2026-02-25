import React from 'react';
import { ThemeConfig } from '../../types';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { ModalBase, ModalHeader, ModalContent } from './ModalBase';

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
  const googlePlayLink = `https://play.google.com/store/apps/details?id=com.findmypuppy.app2`;
  
  const referralMessage = `🎮✨ *FIND MY PUPPY - EPIC ADVENTURE AWAITS!* 🐕🌍

Hey! I've been playing this AMAZING game called *Find My Puppy* and I'm OBSESSED! 🎯

🔍 *What's the game?*
Hidden puppies are scattered across beautiful scenes - your mission is to find them ALL! It's like Where's Waldo but with adorable puppies! 🐾

🎁 *EXCLUSIVE WELCOME BONUS FOR YOU!*
Use my referral code and get *25 FREE HINTS* instantly when you sign up! That's enough to clear multiple levels! 💎

🎯 *Why you'll LOVE it:*
✨ 100+ unique levels
🎨 Beautiful themes & graphics  
🏆 Compete on global leaderboard
💡 Smart hint system
📱 Play anywhere, anytime!

🔗 *Get Started Now:*
${referralLink}

📱 *Download the App:*
${googlePlayLink}

🎫 *My Referral Code:* ${referralCode}
(Use this code when signing up to claim your 25 FREE hints!)

⚡ *BONUS:* When you join, I also get 25 hints - so we both win! 🎉

Ready to become a puppy-finding master? Let's see who can find them faster! 🚀🐶

#FindMyPuppy #HiddenPuppies #GameTime`;

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
    const encodedSubject = encodeURIComponent('🎮 Find My Puppy - Get 25 FREE Hints! 🐕✨');
    
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
    <ModalBase isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <ModalHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200 p-6 pb-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
            <i className="fas fa-user-plus text-white text-xl"></i>
          </div>
          <h2 className="text-xl font-black text-slate-800">Refer a Friend</h2>
        </div>
      </ModalHeader>
      <ModalContent className="p-4 space-y-4">
          <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl p-4 border-2 border-purple-200 text-slate-800 max-h-[200px] overflow-y-auto hide-scrollbar shadow-sm">
            <div className="space-y-3">
              <div className="text-center mb-3">
                <p className="text-sm font-black text-purple-700 mb-1">🎮✨ FIND MY PUPPY - EPIC ADVENTURE AWAITS! 🐕🌍</p>
                <p className="text-[10px] text-slate-600 italic">Hidden puppies are waiting to be found!</p>
              </div>
              
              <div className="bg-white/80 rounded-lg p-2 border border-purple-200">
                <p className="text-[10px] text-slate-700 mb-1.5 leading-relaxed">
                  <span className="font-bold text-purple-600">🎁 EXCLUSIVE BONUS:</span> Get <span className="font-black text-red-600">25 FREE HINTS</span> instantly when you sign up using my code!
                </p>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  <span className="font-semibold">✨</span> 100+ levels • Beautiful themes • Global leaderboard • Smart hints
                </p>
              </div>

              <div className="bg-purple-100 rounded-lg p-2 border border-purple-300">
                <p className="text-[9px] font-bold text-purple-800 mb-1">🎫 Your Referral Code:</p>
                <p className="text-sm font-black text-purple-700 bg-white px-2 py-1 rounded font-mono text-center border border-purple-300">{referralCode}</p>
              </div>

              <div className="space-y-1.5">
                <div className="bg-white/60 rounded px-2 py-1 border border-purple-200">
                  <p className="text-[9px] font-semibold text-slate-600 mb-0.5">🔗 Web Link:</p>
                  <p className="text-[9px] text-purple-700 underline select-all break-all italic">{referralLink}</p>
                </div>
                <div className="bg-white/60 rounded px-2 py-1 border border-purple-200">
                  <p className="text-[9px] font-semibold text-slate-600 mb-0.5">📱 Google Play:</p>
                  <p className="text-[9px] text-purple-700 underline select-all break-all italic">{googlePlayLink}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-2 border border-yellow-200">
                <p className="text-[10px] text-slate-700 leading-relaxed">
                  <span className="font-bold">⚡ Win-Win:</span> When you join, we both get <span className="font-black text-orange-600">25 hints</span>! Let's find those puppies together! 🎉
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {!showAppSelector ? (
              <>
                <button 
                  onClick={handleCopyLink}
                  className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border-2 relative ${
                    copied 
                      ? 'bg-green-100 border-green-500 text-green-700 shadow-md' 
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:border-slate-400 shadow-sm'
                  }`}
                >
                  <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                  {copied ? 'Copied!' : 'Copy Message'}
                  
                  {/* Tooltip */}
                  {copied && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-lg animate-bounce-short z-50">
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
                <p className="text-[10px] font-black uppercase tracking-widest text-center text-slate-600 mb-2">Select App to Share</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => shareToApp('whatsapp')}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-green-50 hover:bg-green-100 transition-colors border border-green-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md">
                      <i className="fab fa-whatsapp text-xl"></i>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">WhatsApp</span>
                  </button>
                  <button 
                    onClick={() => shareToApp('telegram')}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-md">
                      <i className="fab fa-telegram-plane text-xl"></i>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Telegram</span>
                  </button>
                  <button 
                    onClick={() => shareToApp('email')}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center shadow-md">
                      <i className="fas fa-envelope text-lg"></i>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Email</span>
                  </button>
                </div>
                <button 
                  onClick={() => setShowAppSelector(false)}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <i className="fas fa-chevron-left mr-1"></i> Back
                </button>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              Discover • Share • Find Puppies 🐕✨
            </p>
          </div>
      </ModalContent>
    </ModalBase>
  );
};

