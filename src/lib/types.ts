export interface Player {
  id: string;
  name: string;
  nickname?: string;
  avatar?: string;
  handicap: number;
}

export interface Flight {
  id: string;
  playerId: string;
  travelMode: 'flight' | 'car';
  airline: string;
  flightNumber: string;
  arrivalTime: string;
  terminal?: string;
  departureCity?: string;
  status: 'scheduled' | 'en-route' | 'landed' | 'delayed' | 'cancelled' | 'arrived';
}

export interface TeeTime {
  id: string;
  date: string;
  time: string;
  course: string;
  holes: 9 | 18;
  teams: TeamPairing[];
}

export interface TeamPairing {
  name: string;
  playerIds: string[];
}

export interface Event {
  id: string;
  date: string;
  time: string;
  title: string;
  description?: string;
  type: 'golf' | 'dinner' | 'bar' | 'activity' | 'other';
}

export interface ScheduleDay {
  date: string;
  teeTimes: TeeTime[];
  events: Event[];
}

export interface Score {
  id: string;
  roundId: string;
  playerId: string;
  holes: (number | null)[];
  total: number;
  netTotal?: number;
}

export interface Round {
  id: string;
  date: string;
  course: string;
  holes: 9 | 18;
  format: 'stroke' | 'best-ball' | 'scramble' | 'match';
  scores: Score[];
  complete: boolean;
}

export interface Bet {
  id: string;
  type: 'nassau' | 'skins' | 'closest-to-pin' | 'long-drive' | 'custom';
  title: string;
  amount: number;
  roundId?: string;
  participants: string[];
  results: BetResult[];
  settled: boolean;
}

export interface BetResult {
  playerId: string;
  amount: number; // positive = won, negative = lost
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: string;
  category: 'greens-fees' | 'meals' | 'drinks' | 'lodging' | 'transport' | 'other';
}

export interface Room {
  id: string;
  name: string;
  number?: string;
  playerIds: string[];
  notes?: string;
}

export interface Message {
  id: string;
  playerId: string;
  text: string;
  timestamp: string;
  imageUrl?: string;
  pinned: boolean;
  reactions: Record<string, string[]>; // emoji -> playerIds
}

export interface TripConfig {
  tripName: string;
  location: string;
  startDate: string;
  endDate: string;
  passcode: string;
}
