export type UserRole = 'volunteer' | 'admin' | 'ngo' | 'sponsor';
export type ProfileStatus = 'pending' | 'approved' | 'rejected';
export type EventStatus = 'active' | 'completed' | 'cancelled';
export type ApplicationStatus = 'pending' | 'selected' | 'rejected';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: ProfileStatus;
  phone?: string | null;
  bio?: string | null;
  skills?: string | null;
  availability?: string | null;
  website?: string | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NgoEvent {
  id: string;
  ngo_id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  required_skills: string;
  volunteer_limit: number;
  funding_goal: number;
  accumulated_funds: number;
  funding_active: boolean;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  ngo?: Profile;
}

export interface EventApplication {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  event?: NgoEvent;
  volunteer?: Profile;
}

export interface Donation {
  id: string;
  event_id: string;
  sponsor_id: string;
  amount: number;
  created_at: string;
  // Joined fields
  event?: NgoEvent;
  sponsor?: Profile;
}

export interface Message {
  id: string;
  event_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  // Joined fields
  sender?: Profile;
  receiver?: Profile;
  event?: NgoEvent;
}
