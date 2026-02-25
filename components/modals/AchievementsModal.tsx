import React, { useEffect, useState } from 'react';
import { ThemeConfig } from '../../types';
import { db } from '../../services/db';
import { ModalBase, ModalHeader, ModalContent } from './ModalBase';

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

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} maxWidth="md">
      <ModalHeader className="bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-50 p-6 pb-4 border-b border-amber-200">
        <div className="text-center">
          <div className="text-3xl mb-1">🏅</div>
          <h2 className="text-xl font-black text-slate-800">Achievements</h2>
          <p className="text-xs text-slate-600">{unlockedIds.length} of {definitions.length} unlocked</p>
        </div>
      </ModalHeader>
      <ModalContent className="p-6 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8"><div className="text-2xl animate-spin">🎮</div></div>
        ) : (
          definitions.map((a) => {
            const unlocked = unlockedIds.includes(a.id);
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                  unlocked 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 text-slate-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 opacity-70'
                }`}
              >
                <span className="text-2xl">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{a.name}</p>
                  <p className="text-xs text-slate-600">{a.desc}</p>
                </div>
                {unlocked ? (
                  <i className="fas fa-check-circle text-green-500"></i>
                ) : (
                  <i className="fas fa-lock text-slate-400"></i>
                )}
              </div>
            );
          })
        )}
      </ModalContent>
    </ModalBase>
  );
};
