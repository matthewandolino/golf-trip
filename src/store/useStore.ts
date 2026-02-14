import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, Flight, ScheduleDay, Round, Bet, BetResult, Expense, Room, Message, TripConfig } from '../lib/types';
import { PLAYERS, TRIP_CONFIG, DEFAULT_SCHEDULE } from '../lib/constants';

interface AuthState {
  currentPlayerId: string | null;
  authenticated: boolean;
}

interface AppState {
  // Data
  players: Player[];
  flights: Flight[];
  schedule: ScheduleDay[];
  rounds: Round[];
  bets: Bet[];
  expenses: Expense[];
  rooms: Room[];
  messages: Message[];
  tripConfig: TripConfig;
  auth: AuthState;

  // Active player (for demo / multi-user simulation)
  activePlayerId: string;
  setActivePlayerId: (id: string) => void;

  // Auth actions
  authenticate: (passcode: string) => boolean;
  setCurrentPlayer: (playerId: string) => void;
  logout: () => void;

  // Flight actions
  addFlight: (flight: Flight) => void;
  updateFlight: (id: string, updates: Partial<Flight>) => void;
  removeFlight: (id: string) => void;

  // Schedule actions
  addScheduleDay: (day: ScheduleDay) => void;
  updateScheduleDay: (date: string, updates: Partial<ScheduleDay>) => void;
  addTeeTime: (date: string, teeTime: ScheduleDay['teeTimes'][0]) => void;
  addEvent: (date: string, event: ScheduleDay['events'][0]) => void;
  removeTeeTime: (date: string, teeTimeId: string) => void;
  removeEvent: (date: string, eventId: string) => void;

  // Round actions
  addRound: (round: Round) => void;
  updateRound: (id: string, updates: Partial<Round>) => void;
  deleteRound: (id: string) => void;

  // Bet actions
  addBet: (bet: Bet) => void;
  updateBet: (id: string, updates: Partial<Bet>) => void;
  deleteBet: (id: string) => void;
  settleBet: (id: string, results: BetResult[]) => void;

  // Expense actions
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Room actions
  addRoom: (room: Room) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  removeRoom: (id: string) => void;

  // Message actions
  addMessage: (message: Message) => void;
  removeMessage: (id: string) => void;
  togglePin: (id: string) => void;
  addReaction: (messageId: string, emoji: string, playerId: string) => void;
  removeReaction: (messageId: string, emoji: string, playerId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Data
      players: PLAYERS,
      flights: [],
      schedule: DEFAULT_SCHEDULE,
      rounds: [],
      bets: [],
      expenses: [],
      rooms: [],
      messages: [],
      tripConfig: TRIP_CONFIG,
      auth: {
        currentPlayerId: null,
        authenticated: false,
      },

      // Active player
      activePlayerId: '1',
      setActivePlayerId: (id) => set({ activePlayerId: id }),

      // Auth actions
      authenticate: (passcode: string) => {
        if (passcode === get().tripConfig.passcode) {
          set((s) => ({ auth: { ...s.auth, authenticated: true } }));
          return true;
        }
        return false;
      },
      setCurrentPlayer: (playerId: string) => {
        set((s) => ({
          auth: { ...s.auth, currentPlayerId: playerId },
          activePlayerId: playerId,
        }));
      },
      logout: () => {
        set({ auth: { currentPlayerId: null, authenticated: false } });
      },

      // Flight actions
      addFlight: (flight) => set((s) => ({ flights: [...s.flights, flight] })),
      updateFlight: (id, updates) =>
        set((s) => ({
          flights: s.flights.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        })),
      removeFlight: (id) =>
        set((s) => ({ flights: s.flights.filter((f) => f.id !== id) })),

      // Schedule actions
      addScheduleDay: (day) => set((s) => ({ schedule: [...s.schedule, day] })),
      updateScheduleDay: (date, updates) =>
        set((s) => ({
          schedule: s.schedule.map((d) => (d.date === date ? { ...d, ...updates } : d)),
        })),
      addTeeTime: (date, teeTime) =>
        set((s) => {
          const existing = s.schedule.find((d) => d.date === date);
          if (existing) {
            return {
              schedule: s.schedule.map((d) =>
                d.date === date ? { ...d, teeTimes: [...d.teeTimes, teeTime] } : d
              ),
            };
          }
          return { schedule: [...s.schedule, { date, teeTimes: [teeTime], events: [] }] };
        }),
      addEvent: (date, event) =>
        set((s) => {
          const existing = s.schedule.find((d) => d.date === date);
          if (existing) {
            return {
              schedule: s.schedule.map((d) =>
                d.date === date ? { ...d, events: [...d.events, event] } : d
              ),
            };
          }
          return { schedule: [...s.schedule, { date, teeTimes: [], events: [event] }] };
        }),
      removeTeeTime: (date, teeTimeId) =>
        set((s) => ({
          schedule: s.schedule.map((d) =>
            d.date === date
              ? { ...d, teeTimes: d.teeTimes.filter((t) => t.id !== teeTimeId) }
              : d
          ),
        })),
      removeEvent: (date, eventId) =>
        set((s) => ({
          schedule: s.schedule.map((d) =>
            d.date === date
              ? { ...d, events: d.events.filter((e) => e.id !== eventId) }
              : d
          ),
        })),

      // Round actions
      addRound: (round) => set((s) => ({ rounds: [...s.rounds, round] })),
      updateRound: (id, updates) =>
        set((s) => ({
          rounds: s.rounds.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      deleteRound: (id) =>
        set((s) => ({ rounds: s.rounds.filter((r) => r.id !== id) })),

      // Bet actions
      addBet: (bet) => set((s) => ({ bets: [...s.bets, bet] })),
      updateBet: (id, updates) =>
        set((s) => ({
          bets: s.bets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      deleteBet: (id) =>
        set((s) => ({ bets: s.bets.filter((b) => b.id !== id) })),
      settleBet: (id, results) =>
        set((s) => ({
          bets: s.bets.map((b) =>
            b.id === id ? { ...b, results, settled: true } : b
          ),
        })),

      // Expense actions
      addExpense: (expense) => set((s) => ({ expenses: [...s.expenses, expense] })),
      updateExpense: (id, updates) =>
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      // Room actions
      addRoom: (room) => set((s) => ({ rooms: [...s.rooms, room] })),
      updateRoom: (id, updates) =>
        set((s) => ({
          rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      removeRoom: (id) =>
        set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),

      // Message actions
      addMessage: (message) =>
        set((s) => ({ messages: [...s.messages, message] })),
      removeMessage: (id) =>
        set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
      togglePin: (id) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, pinned: !m.pinned } : m
          ),
        })),
      addReaction: (messageId, emoji, playerId) =>
        set((s) => ({
          messages: s.messages.map((m) => {
            if (m.id !== messageId) return m;
            const existing = m.reactions[emoji] ?? [];
            const hasReacted = existing.includes(playerId);
            const updated = hasReacted
              ? existing.filter((p) => p !== playerId)
              : [...existing, playerId];
            return {
              ...m,
              reactions: { ...m.reactions, [emoji]: updated },
            };
          }),
        })),
      removeReaction: (messageId, emoji, playerId) =>
        set((s) => ({
          messages: s.messages.map((m) => {
            if (m.id !== messageId) return m;
            const current = m.reactions[emoji] ?? [];
            const updated = current.filter((id) => id !== playerId);
            const newReactions = { ...m.reactions };
            if (updated.length === 0) {
              delete newReactions[emoji];
            } else {
              newReactions[emoji] = updated;
            }
            return { ...m, reactions: newReactions };
          }),
        })),
    }),
    {
      name: 'golf-trip-store-v3',
      partialize: (state) => ({
        flights: state.flights,
        schedule: state.schedule,
        rounds: state.rounds,
        bets: state.bets,
        expenses: state.expenses,
        rooms: state.rooms,
        messages: state.messages,
        auth: state.auth,
        activePlayerId: state.activePlayerId,
      }),
    }
  )
);
