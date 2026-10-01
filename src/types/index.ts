export type SlotStatus = 'available' | 'booked' | 'pending' | 'waitlist';
export type BookingMode = 'full' | 'deposit' | 'reserve';

export interface SlotRecord {
  id: string;
  time: string;
  status: SlotStatus;
  user?: string;
  price: number;
  deposit?: number;
  waitlistCount?: number;
  note?: string;
  bookedBy?: {
    name?: string;
    phone?: string;
  };
}

export interface Pitch {
  id: string;
  name: string;
  surface: string;
  price: number;
  location: string;
  size: string;
  rating: number;
  isIndoor: boolean;
  description: string;
  slots: SlotRecord[];
}

export interface UserTrust {
  id: string;
  name: string;
  trustScore: number;
  penalties: number;
  prepaidOnly: boolean;
}
