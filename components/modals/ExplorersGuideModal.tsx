import React from 'react';
import { ModalBase, ModalHeader, ModalContent, ModalFooter } from './ModalBase';

const VIDEO_URL = 'https://www.youtube.com/watch?v=_aBm0CZDCPo';
const PRIVACY_URL = '/privacy-policy.html';

interface ExplorersGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullGuide: () => void;
  onOpenPuppyDesigns?: () => void;
  onNavigateToDeleteAccount?: () => void;
}

export const ExplorersGuideModal: React.FC<ExplorersGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenFullGuide,
  onOpenPuppyDesigns,
  onNavigateToDeleteAccount
}) => {
  const handleFullGuide = () => {
    onClose();
    onOpenFullGuide();
  };

  const handleVideo = () => {
    window.open(VIDEO_URL, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteAccount = () => {
    onClose();
    onNavigateToDeleteAccount?.();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} maxWidth="md" showCloseButton>
      <ModalHeader className="bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-pink-500 flex items-center justify-center">
            <i className="fas fa-book text-white text-lg" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Explorer's Guide</h2>
            <p className="text-sm text-slate-700">Quick game overview</p>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="p-6 flex flex-col gap-5">
        {/* 1. Intro */}
        <div className="bg-pink-50 rounded-2xl p-4 text-slate-800 text-sm leading-relaxed">
          Find hidden puppies in each scene. <strong>Pan</strong> to explore, <strong>zoom</strong> to look closer, <strong>tap</strong> when you spot one. You have <strong>3 lives</strong>; wrong taps cost a life. Use <strong>2 free hints</strong> per level (💡 button).
        </div>

        {/* 2. Quick actions */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleFullGuide}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md transition-colors"
          >
            <i className="fas fa-map" aria-hidden />
            Full Guide
          </button>
          <button
            type="button"
            onClick={handleVideo}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-md transition-colors"
          >
            <i className="fas fa-play-circle" aria-hidden />
            Video
          </button>
        </div>

        {/* 3. Guest / Login */}
        <p className="text-slate-800 text-sm">
          <strong>Guest:</strong> Play instantly. <strong>Login:</strong> Save progress, leaderboard, daily rewards, buy hints.
        </p>

        {/* 4. Difficulty table */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="bg-slate-800 px-4 py-3">
            <span className="text-white font-semibold text-sm">Difficulty</span>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between px-4 py-3 bg-white">
              <span className="text-green-600 font-semibold text-sm">Easy</span>
              <span className="text-slate-700 text-sm">No timer · 15–25 pups · +5 pts</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-white">
              <span className="text-blue-600 font-semibold text-sm">Medium</span>
              <span className="text-slate-700 text-sm">2m 30s · 25–35 pups · +10 pts</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-red-50">
              <span className="text-red-600 font-semibold text-sm">Hard</span>
              <span className="text-slate-700 text-sm">3 min · 40–50 pups · +15 pts</span>
            </div>
          </div>
        </div>

        {/* 5. Hints */}
        <p className="text-slate-800 text-sm">
          <strong>Hints:</strong> 2 free per level; buy more with points or hint packs (login).
        </p>

        {/* 6. Daily */}
        <p className="text-slate-800 text-sm">
          <strong>Daily:</strong> Check in for points; 7-day streak = 10 hints; 30-day streak = 50 hints.
        </p>

        {/* 7. Puppy Jump */}
        <p className="text-slate-800 text-sm">
          <strong>Puppy Jump:</strong> Daily mini-game for extra hints.
        </p>

      </ModalContent>

      <ModalFooter className="px-6 py-4 border-t border-slate-200 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
          <a
            href={PRIVACY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Privacy
          </a>
          <span className="text-red-500">·</span>
          {onNavigateToDeleteAccount ? (
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm bg-transparent border-0 cursor-pointer"
            >
              Delete account
            </button>
          ) : (
            <span className="text-purple-600 font-medium text-sm">Delete account</span>
          )}
        </div>
        <p className="text-slate-500 text-xs">© 2025–2026 MVTechnology</p>
      </ModalFooter>
    </ModalBase>
  );
};
