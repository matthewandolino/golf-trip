import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Plane, Calendar, Trophy, DollarSign, Receipt, Bed, MessageCircle } from 'lucide-react';
import { TABS } from '../lib/constants';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Home,
  Plane,
  Calendar,
  Trophy,
  DollarSign,
  Receipt,
  Bed,
  MessageCircle,
};

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.pathname === '/' ? 'home' : location.pathname.slice(1);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-4 gap-0">
          {TABS.map((tab) => {
            const Icon = ICON_MAP[tab.icon];
            const isActive = currentTab === tab.id;
            const path = tab.id === 'home' ? '/' : `/${tab.id}`;

            return (
              <button
                key={tab.id}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center py-2 transition-colors relative ${
                  isActive ? 'text-[#c9a84c]' : 'text-white/60'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#c9a84c] rounded-full" />
                )}
                {Icon && <Icon size={18} />}
                <span className="text-[9px] mt-0.5 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
