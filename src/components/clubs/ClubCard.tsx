import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Mail, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClubLike {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  member_count?: number | null;
  coordinator_name?: string;
  coordinator_email: string;
  logo_url?: string | null;
}

interface ClubCardProps {
  club: ClubLike;
  showActions?: boolean;
  onApprove?: (clubId: string) => void;
  onReject?: (clubId: string) => void;
  /** If true, clicking the card navigates to /clubs/:id */
  linkable?: boolean;
}

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  approved: 'bg-green-500/10 text-green-600 border-green-200',
  rejected: 'bg-red-500/10 text-red-600 border-red-200',
};

export function ClubCard({ club, showActions = false, onApprove, onReject, linkable = true }: ClubCardProps) {
  const inner = (
    <Card className={cn('overflow-hidden group', linkable && club.status === 'approved' && 'card-hover cursor-pointer')}>
      <div className="h-20 bg-gradient-to-br from-accent via-accent/80 to-primary relative overflow-hidden flex items-center justify-center">
        {club.logo_url ? (
          <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-8 h-8 text-primary-foreground/60" />
        )}
        <div className="absolute bottom-2 right-2">
          <Badge className={cn('border text-xs', statusColors[club.status])}>
            {club.status.charAt(0).toUpperCase() + club.status.slice(1)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className={cn('font-display text-base font-semibold', linkable && 'group-hover:text-primary transition-colors')}>
            {club.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{club.description}</p>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-accent" />
            <span>{club.member_count || 0} members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-accent" />
            <span className="truncate">{club.coordinator_email}</span>
          </div>
        </div>

        {showActions && club.status === 'pending' && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" className="flex-1 text-destructive hover:text-destructive"
              onClick={(e) => { e.preventDefault(); onReject?.(club.id); }}>
              Reject
            </Button>
            <Button size="sm" className="flex-1 bg-success hover:bg-success/90"
              onClick={(e) => { e.preventDefault(); onApprove?.(club.id); }}>
              Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (linkable && club.status === 'approved') {
    return <Link to={`/clubs/${club.id}`} className="block">{inner}</Link>;
  }

  return inner;
}
