export type UserRole = 'admin' | 'club_admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  clubId?: string; // For club admins
  createdAt: Date;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  adminId: string;
  createdAt: Date;
  memberCount?: number;
}

export type EventType = 'workshop' | 'fest' | 'competition' | 'seminar' | 'cultural' | 'sports' | 'tech' | 'other';
export type EventStatus = 'pending' | 'approved' | 'rejected' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  time: string;
  venue: string;
  registrationDeadline: Date;
  eventType: EventType;
  status: EventStatus;
  clubId: string;
  clubName: string;
  poster?: string;
  maxParticipants?: number;
  registrationCount: number;
  createdAt: Date;
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  registeredAt: Date;
  status: 'confirmed' | 'cancelled' | 'waitlist';
}

export interface DashboardStats {
  totalEvents: number;
  totalClubs: number;
  totalRegistrations: number;
  pendingApprovals: number;
  upcomingEvents: number;
  activeClubs: number;
}
