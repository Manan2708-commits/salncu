export type UserRole = 'admin' | 'club_admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  clubId?: string;
  createdAt: Date;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logo_url?: string | null;
  coordinator_name: string;
  coordinator_email: string;
  coordinator_phone?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_user_id?: string | null;
  member_count?: number | null;
  created_at: string;
  // legacy aliases used by older components
  logo?: string;
  coordinatorName?: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  adminId?: string;
  memberCount?: number;
  createdAt?: Date;
}

export type EventType = 'workshop' | 'fest' | 'competition' | 'seminar' | 'cultural' | 'sports' | 'tech' | 'other';
export type EventStatus = 'pending' | 'approved' | 'rejected' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  club_id: string;
  name: string;
  description: string;
  event_date: string;
  event_time: string;
  venue: string;
  registration_deadline: string;
  event_type: EventType;
  status: EventStatus;
  poster_url?: string | null;
  max_participants?: number | null;
  // report
  report_summary?: string | null;
  report_attendance?: number | null;
  report_feedback_rating?: number | null;
  report_expenses?: number | null;
  report_submitted_at?: string | null;
  // joined
  club?: { name: string } | null;
  registration_count?: number;
  // legacy aliases
  date?: Date;
  time?: string;
  registrationDeadline?: Date;
  eventType?: EventType;
  clubId?: string;
  clubName?: string;
  poster?: string;
  maxParticipants?: number;
  registrationCount?: number;
  createdAt?: Date;
}

export interface Registration {
  id: string;
  event_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  status: 'confirmed' | 'cancelled' | 'waitlist' | 'attended';
  created_at: string;
}
