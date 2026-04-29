import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClubLike {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  member_count?: number | null;
  coordinator_email: string;
  coordinator_phone?: string | null;
}

interface ClubCardProps {
  club: ClubLike;
  showActions?: boolean;
  onApprove?: (clubId: string) => void;
  onReject?: (clubId: string) => void;
}

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  approved: 'bg-green-500/10 text-green-600 border-green-200',
  rejected: 'bg-red-500/10 text-red-600 border-red-200',
};

export function ClubCard({ club, showActions = false, onApprove, onReject }: ClubCardProps) {
  return (
    <Card className="card-hover overflow-hidden group">
      <div className="h-24 bg-gradient-to-br from-accent via-accent/80 to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-3 right-3">
          <Badge className={cn('border', statusColors[club.status])}>
            {club.status.charAt(0).toUpperCase() + club.status.slice(1)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
              {club.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{club.description}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4 text-accent" />
              <span>{club.member_count || 0} members</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 text-accent" />
              <span className="truncate">{club.coordinator_email}</span>
            </div>
            {club.coordinator_phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-accent" />
                <span>{club.coordinator_phone}</span>
              </div>
            )}
          </div>

          {showActions && club.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1 text-destructive hover:text-destructive" onClick={() => onReject?.(club.id)}>
                Reject
              </Button>
              <Button size="sm" className="flex-1 bg-success hover:bg-success/90" onClick={() => onApprove?.(club.id)}>
                Approve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
