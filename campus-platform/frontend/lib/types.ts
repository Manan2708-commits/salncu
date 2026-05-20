export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'club_admin' | 'super_admin';
  avatar: string;
  clubId?: string;
  createdAt: string;
}

export interface Club {
  _id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  banner: string;
  adminId: { _id: string; name: string; email: string };
  memberCount: number;
  isActive: boolean;
  socialLinks: { instagram: string; twitter: string; website: string };
  createdAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  banner: string;
  clubId: { _id: string; name: string; logo: string };
  clubName: string;
  category: string;
  maxParticipants: number | null;
  participantCount: number;
  registrationDeadline: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ClubRequest {
  _id: string;
  clubName: string;
  description: string;
  category: string;
  logo: string;
  banner: string;
  applicantId: { _id: string; name: string; email: string };
  applicantName: string;
  applicantEmail: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes: string;
  reviewedBy?: { _id: string; name: string };
  reviewedAt?: string;
  createdAt: string;
}
