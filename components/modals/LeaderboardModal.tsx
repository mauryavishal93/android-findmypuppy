import React, { useEffect, useState } from 'react';
import { ThemeConfig } from '../../types';
import { db } from '../../services/db';
import { ModalBase, ModalHeader, ModalContent, ModalFooter } from './ModalBase';

interface LeaderboardEntry {
  username: string;
  rank: number;
  points: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeConfig;
  currentUsername?: string;
}

interface ReferralEntry {
  username: string;
  rank: number;
  referredCount: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  currentUsername
}) => {
  const [tab, setTab] = useState<'points' | 'referrals'>('points');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referralLeaderboard, setReferralLeaderboard] = useState<ReferralEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (tab === 'points') loadLeaderboard();
      else loadReferralLeaderboard();
    }
  }, [isOpen, currentUsername, tab]);

  const loadReferralLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await db.getLeaderboardReferrals();
      if (res.success && res.leaderboard) setReferralLeaderboard(res.leaderboard);
      else setReferralLeaderboard([]);
    } catch {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    setCurrentUser(null); // Reset current user
    try {
      const response = await db.getLeaderboard(currentUsername);
      if (response.success && response.leaderboard) {
        setLeaderboard(response.leaderboard);
        // Set current user if they're not in top 10
        // response.currentUser will be set only if user exists and is NOT in top 10
        if (response.currentUser && currentUsername) {
          setCurrentUser(response.currentUser);
        } else {
          setCurrentUser(null);
        }
      } else {
        setError(response.message || 'Failed to load leaderboard');
      }
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Leaderboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
    return 'bg-slate-600 text-white';
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} maxWidth="md">
      <ModalHeader className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 p-6 pb-4 border-b border-amber-200">
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">Leaderboard</h2>
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => setTab('points')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                tab === 'points' 
                  ? 'bg-amber-500 text-white shadow-lg' 
                  : 'bg-white border border-slate-300 text-slate-700'
              }`}
            >
              Points
            </button>
            <button
              onClick={() => setTab('referrals')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                tab === 'referrals' 
                  ? 'bg-amber-500 text-white shadow-lg' 
                  : 'bg-white border border-slate-300 text-slate-700'
              }`}
            >
              Top Referrers
            </button>
          </div>
        </div>
      </ModalHeader>
      <ModalContent className="p-6">
        {/* Leaderboard Content */}
        {tab === 'referrals' ? (
          loading ? (
            <div className="flex justify-center py-12"><div className="text-3xl animate-spin">🎮</div></div>
          ) : referralLeaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-600">No referrers yet. Share your link to climb!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {referralLeaderboard.map((entry) => (
                <div key={entry.rank} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                    entry.rank <= 3 ? getRankBadgeStyle(entry.rank) : 'bg-slate-600 text-white'
                  }`}>
                    {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
                  </div>
                  <div className="flex-1 font-bold text-sm truncate text-slate-700">{entry.username}</div>
                  <div className="px-3 py-1 rounded-full font-black text-sm bg-blue-100 text-blue-600">
                    {entry.referredCount} referred
                  </div>
                </div>
              ))}
            </div>
          )
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-3xl mb-2 animate-spin">🎮</div>
              <p className="text-sm text-slate-600">Loading leaderboard...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">😕</div>
            <p className="text-sm text-slate-600 mb-4">{error}</p>
            <button
              onClick={loadLeaderboard}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white font-bold hover:scale-105 active:scale-95 transition-transform shadow-md"
            >
              Try Again
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-slate-600">No players yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {/* Top 10 Leaderboard */}
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.username === currentUsername;
              return (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-300 border-2 border-yellow-400 shadow-lg'
                      : 'bg-white border border-slate-200'
                  }`}
                  style={{
                    boxShadow: isCurrentUser 
                      ? '0 4px 12px rgba(255,215,0,0.3)' 
                      : '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Rank Badge */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                    isCurrentUser && entry.rank === 1
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-2 border-yellow-300'
                      : entry.rank <= 3 
                      ? getRankBadgeStyle(entry.rank)
                      : 'bg-slate-600 text-white'
                  }`}>
                    {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
                  </div>

                  {/* Username */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm truncate ${
                      isCurrentUser ? 'text-slate-800' : 'text-slate-700'
                    }`}>
                      {entry.username}
                      {isCurrentUser && <span className="ml-2 text-xs opacity-80">(You)</span>}
                    </div>
                  </div>

                  {/* Points */}
                  <div className={`flex-shrink-0 px-3 py-1 rounded-full font-black text-sm ${
                    isCurrentUser 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {entry.points.toLocaleString()} pts
                  </div>
                </div>
              );
            })}

            {/* Divider if current user is shown at bottom (Not in Top 10) */}
            {currentUser && (
              <>
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <div className="text-xs text-slate-500 px-2">Your Rank</div>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                {/* Current User (Not in Top 10) - Purple-Pink Gradient Highlight */}
                <div
                  className="flex items-center gap-3 p-3 rounded-xl transition-all bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-yellow-400 shadow-lg"
                  style={{
                    boxShadow: '0 4px 12px rgba(255,215,0,0.3)',
                  }}
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm bg-purple-600 border-2 border-white text-white">
                    #{currentUser.rank}
                  </div>

                  {/* Username */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate text-white">
                      {currentUser.username}
                      <span className="ml-2 text-xs opacity-90">(You)</span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex-shrink-0 px-3 py-1 rounded-full font-black text-sm bg-pink-600 text-white">
                    {currentUser.points.toLocaleString()} pts
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </ModalContent>
      <ModalFooter className="p-6 pt-0 text-center">
        <p className="text-xs text-slate-500">
          Rankings are based on total points earned
        </p>
      </ModalFooter>
    </ModalBase>
  );
};
