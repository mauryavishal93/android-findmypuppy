import React, { useEffect, useState } from 'react';
import { ThemeConfig } from '../../types';
import { db } from '../../services/db';

interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeConfig;
  username: string | null;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  username
}) => {
  const [definitions, setDefinitions] = useState<AchievementDef[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([
      db.getAchievements(),
      username ? db.checkAchievements(username) : Promise.resolve({ success: false })
    ]).then(([defRes, checkRes]) => {
      if (defRes.success && defRes.achievements) setDefinitions(defRes.achievements);
      if (checkRes.success && checkRes.achievements) setUnlockedIds(checkRes.achievements);
      setLoading(false);
    });
  }, [isOpen, username]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div
        className={`${activeTheme.cardBg} ${activeTheme.text} rounded-2xl p-6 w-full max-w-md shadow-2xl relative border-2 border-white/20 max-h-[85vh] flex flex-col`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full ${activeTheme.iconBg} flex items-center justify-center hover:scale-110`}
        >
          <i className="fas fa-times text-sm"></i>
        </button>
        <div className="text-center mb-4">
          <div className="text-3xl mb-1">🏅</div>
          <h2 className="text-xl font-black">Achievements</h2>
          <p className={`text-xs ${activeTheme.subText}`}>{unlockedIds.length} of {definitions.length} unlocked</p>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex justify-center py-8"><div className="text-2xl animate-spin">🎮</div></div>
          ) : (
            definitions.map((a) => {
              const unlocked = unlockedIds.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                    unlocked ? 'bg-green-500/20 border-green-400/50' : `${activeTheme.cardBg} border-white/10 opacity-70`
                  }`}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{a.name}</p>
                    <p className={`text-xs ${activeTheme.subText}`}>{a.desc}</p>
                  </div>
                  {unlocked && <i className="fas fa-check-circle text-green-500"></i>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
