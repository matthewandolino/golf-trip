import type { Player, TripConfig, ScheduleDay } from './types';

export const TRIP_CONFIG: TripConfig = {
  tripName: "Biltmore Forest Golf Trip",
  location: "Biltmore Forest Country Club",
  startDate: "2026-04-24",
  endDate: "2026-04-27",
  passcode: "biltmore2026",
};

export const PLAYERS: Player[] = [
  { id: '1', name: 'Stuart Fogartie', handicap: 12 },
  { id: '2', name: 'Alan King', handicap: 8 },
  { id: '3', name: 'Matt Shortall', handicap: 15 },
  { id: '4', name: 'Matt Kuenzel', handicap: 10 },
  { id: '5', name: 'Shelton Smith', handicap: 18 },
  { id: '6', name: 'Joe Papalia', handicap: 6 },
  { id: '7', name: 'Matt Andolino', handicap: 14 },
  { id: '8', name: 'Canor Pato', handicap: 11 },
];

export const DEFAULT_SCHEDULE: ScheduleDay[] = [
  {
    date: '2026-04-24',
    teeTimes: [
      {
        id: 'tt-thu-1',
        date: '2026-04-24',
        time: '14:00',
        course: 'Biltmore Forest CC',
        holes: 18,
        teams: [],
      },
    ],
    events: [
      { id: 'ev-thu-1', date: '2026-04-24', time: '12:00', title: 'Arrival', type: 'activity' },
      { id: 'ev-thu-2', date: '2026-04-24', time: '12:30', title: "Lunch in Men's Locker Room Bar", type: 'dinner' },
      { id: 'ev-thu-3', date: '2026-04-24', time: '19:00', title: 'Dinner in Grill Room', type: 'dinner' },
    ],
  },
  {
    date: '2026-04-25',
    teeTimes: [
      {
        id: 'tt-fri-am',
        date: '2026-04-25',
        time: '08:30',
        course: 'Biltmore Forest CC',
        holes: 18,
        teams: [],
      },
      {
        id: 'tt-fri-pm',
        date: '2026-04-25',
        time: '13:30',
        course: 'Biltmore Forest CC',
        holes: 18,
        teams: [],
      },
    ],
    events: [
      { id: 'ev-fri-1', date: '2026-04-25', time: '07:30', title: "Breakfast in Men's Locker Room Bar", type: 'dinner' },
      { id: 'ev-fri-2', date: '2026-04-25', time: '12:30', title: "Lunch in Men's Locker Room Bar", type: 'dinner' },
      { id: 'ev-fri-3', date: '2026-04-25', time: '19:30', title: 'Dinner in the Wine Cellar', type: 'dinner' },
    ],
  },
  {
    date: '2026-04-26',
    teeTimes: [
      {
        id: 'tt-sat-am',
        date: '2026-04-26',
        time: '08:50',
        course: 'Biltmore Forest CC',
        holes: 18,
        teams: [],
      },
      {
        id: 'tt-sat-pm',
        date: '2026-04-26',
        time: '13:50',
        course: 'Biltmore Forest CC',
        holes: 18,
        teams: [],
      },
    ],
    events: [
      { id: 'ev-sat-1', date: '2026-04-26', time: '08:00', title: "Breakfast in Men's Locker Room Bar", type: 'dinner' },
      { id: 'ev-sat-2', date: '2026-04-26', time: '13:00', title: "Lunch in Men's Locker Room Bar", type: 'dinner' },
      { id: 'ev-sat-3', date: '2026-04-26', time: '19:00', title: 'Dinner off Property', type: 'dinner' },
    ],
  },
  {
    date: '2026-04-27',
    teeTimes: [
      {
        id: 'tt-sun-am',
        date: '2026-04-27',
        time: '08:30',
        course: 'Biltmore Forest CC',
        holes: 18,
        teams: [],
      },
    ],
    events: [
      { id: 'ev-sun-1', date: '2026-04-27', time: '07:30', title: "Breakfast in Men's Locker Room Bar", type: 'dinner' },
      { id: 'ev-sun-2', date: '2026-04-27', time: '11:00', title: 'Check Out (Before Tee Time)', type: 'activity' },
      { id: 'ev-sun-3', date: '2026-04-27', time: '12:30', title: "Lunch in Men's Locker Room Bar", type: 'dinner' },
    ],
  },
];

export const BACKGROUND_IMAGES = {
  home: '/assets/backgrounds/clubhouse.jpg',
  travel: '/assets/backgrounds/group-photo.jpeg',
  schedule: '/assets/backgrounds/fairway-2nd-hole.jpg',
  scorecard: '/assets/backgrounds/fairway-7th-hole.jpg',
  betting: '/assets/backgrounds/fairway-2nd-hole.jpg',
  expenses: '/assets/backgrounds/dining-room.jpg',
  quarters: '/assets/backgrounds/clubhouse.jpg',
  chat: '/assets/backgrounds/group-photo.jpeg',
};

export const TABS = [
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'travel', label: 'Travel', icon: 'Plane' },
  { id: 'schedule', label: 'Schedule', icon: 'Calendar' },
  { id: 'scorecard', label: 'Scores', icon: 'Trophy' },
  { id: 'betting', label: 'Bets', icon: 'DollarSign' },
  { id: 'expenses', label: 'Expenses', icon: 'Receipt' },
  { id: 'quarters', label: 'Quarters', icon: 'Bed' },
  { id: 'chat', label: 'Chat', icon: 'MessageCircle' },
] as const;

export type TabId = (typeof TABS)[number]['id'];
