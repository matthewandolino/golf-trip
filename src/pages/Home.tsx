import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, differenceInHours, differenceInMinutes, isPast, format, parseISO } from 'date-fns';
import { Plane, Calendar, Trophy, DollarSign, Receipt, Bed, MessageCircle } from 'lucide-react';
import BackgroundPage from '../components/BackgroundPage';
import GlassCard from '../components/GlassCard';
import { useStore } from '../store/useStore';
import { BACKGROUND_IMAGES } from '../lib/constants';

const QUICK_LINKS = [
  { id: 'travel', label: 'Travel', icon: Plane, description: 'Flight info' },
  { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Tee times & events' },
  { id: 'scorecard', label: 'Scores', icon: Trophy, description: 'Scorecards' },
  { id: 'betting', label: 'Bets', icon: DollarSign, description: 'Side action' },
  { id: 'expenses', label: 'Expenses', icon: Receipt, description: 'Split costs' },
  { id: 'quarters', label: 'Quarters', icon: Bed, description: 'Room assignments' },
  { id: 'chat', label: 'Chat', icon: MessageCircle, description: 'Group chat' },
];

function useCountdown(targetDate: string) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const target = new Date(targetDate + 'T08:00:00');
  if (isPast(target)) {
    return { days: 0, hours: 0, minutes: 0, started: true };
  }

  const days = differenceInDays(target, now);
  const hours = differenceInHours(target, now) % 24;
  const minutes = differenceInMinutes(target, now) % 60;

  return { days, hours, minutes, started: false };
}

export default function Home() {
  const navigate = useNavigate();
  const tripConfig = useStore((s) => s.tripConfig);
  const players = useStore((s) => s.players);
  const countdown = useCountdown(tripConfig.startDate);

  return (
    <BackgroundPage backgroundImage={BACKGROUND_IMAGES.home}>
      <div className="max-w-md mx-auto px-4 pt-12 pb-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <img
            src="/assets/bfcc-crest.png"
            alt="Biltmore Forest Country Club"
            className="w-20 h-20 mx-auto mb-4 opacity-90 drop-shadow-lg"
          />
          <p className="text-[#c9a84c] text-sm tracking-[0.3em] uppercase mb-2">
            {tripConfig.location}
          </p>
          <h1 className="text-4xl md:text-5xl text-white mb-3 leading-tight">
            {tripConfig.tripName}
          </h1>
          <p className="text-white/50 text-sm">
            {players.length} players &middot; {format(parseISO(tripConfig.startDate), 'MMM d')}&ndash;{format(parseISO(tripConfig.endDate), 'd, yyyy')}
          </p>
        </div>

        {/* Countdown */}
        {!countdown.started ? (
          <GlassCard className="mb-8">
            <p className="text-center text-white/50 text-xs tracking-widest uppercase mb-3">
              Countdown to Tee Off
            </p>
            <div className="flex items-center justify-center gap-6">
              <CountdownUnit value={countdown.days} label="Days" />
              <div className="text-white/30 text-2xl">:</div>
              <CountdownUnit value={countdown.hours} label="Hours" />
              <div className="text-white/30 text-2xl">:</div>
              <CountdownUnit value={countdown.minutes} label="Min" />
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="mb-8">
            <p className="text-center text-[#c9a84c] text-lg font-semibold">
              The trip is on!
            </p>
          </GlassCard>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <GlassCard
                key={link.id}
                onClick={() => navigate(`/${link.id}`)}
                className="flex flex-col items-start gap-2"
              >
                <Icon size={22} className="text-[#c9a84c]" />
                <div>
                  <p className="text-white font-medium text-sm">{link.label}</p>
                  <p className="text-white/40 text-xs">{link.description}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </BackgroundPage>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}
