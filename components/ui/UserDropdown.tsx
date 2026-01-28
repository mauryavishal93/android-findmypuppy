import React, { useRef, useEffect } from 'react';
import { ThemeConfig } from '../../types';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeConfig;
  onInfoClick: () => void;
  onThemeClick: () => void;
  onPurchaseHistoryClick: () => void;
  onReferClick: () => void;
  onLogout: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  isOpen,
  onClose,
  activeTheme,
  onInfoClick,
  onThemeClick,
  onPurchaseHistoryClick,
  onReferClick,
  onLogout
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100]" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className={`absolute top-full left-0 mt-2 z-[101] min-w-[180px] rounded-2xl shadow-2xl border-2 border-white/50 overflow-hidden ${activeTheme.cardBg} backdrop-blur-md`}
      >
        <div className="py-2">
          {/* Theme Option */}
          <button
            onClick={() => {
              onThemeClick();
              onClose();
            }}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors ${activeTheme.text}`}
          >
            <i className="fas fa-paint-brush text-base"></i>
            <span className="text-sm font-bold">Theme</span>
          </button>
          
          {/* Divider */}
          <div className={`h-px ${activeTheme.text} opacity-20 mx-2`}></div>
          
          {/* Info Option */}
          <button
            onClick={() => {
              onInfoClick();
              onClose();
            }}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors ${activeTheme.text}`}
          >
            <i className="fas fa-info-circle text-base"></i>
            <span className="text-sm font-bold">Info</span>
          </button>
          
          {/* Divider */}
          <div className={`h-px ${activeTheme.text} opacity-20 mx-2`}></div>
          
          {/* Purchase History Option */}
          <button
            onClick={() => {
              onPurchaseHistoryClick();
              onClose();
            }}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors ${activeTheme.text}`}
          >
            <i className="fas fa-history text-base"></i>
            <span className="text-sm font-bold">Buy History</span>
          </button>
          
          {/* Divider */}
          <div className={`h-px ${activeTheme.text} opacity-20 mx-2`}></div>

          {/* Refer a Friend Option */}
          <button
            onClick={() => {
              onReferClick();
              onClose();
            }}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors ${activeTheme.text}`}
          >
            <i className="fas fa-user-plus text-base"></i>
            <span className="text-sm font-bold">Refer a Friend</span>
          </button>
          
          {/* Divider */}
          <div className={`h-px ${activeTheme.text} opacity-20 mx-2`}></div>
          
          {/* Logout Option */}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors text-red-500`}
          >
            <i className="fas fa-sign-out-alt text-base"></i>
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

