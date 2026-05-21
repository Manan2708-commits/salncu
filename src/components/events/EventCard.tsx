import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EventStatus, EventType } from '@/types';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EventLike {
  id: string;
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
  registration_count?: number;
  club?: { name: string } | null;
}

interface EventCardProps {
  event: EventLike;
  showActions?: boolean;
  onRegister?: (eventId: string) => void;
  onUnregister?: () => void;
  isRegistered?: boolean;
}

const eventTypeColors: Record<EventType, string> = {
  workshop: 'bg-blue-500/10 text-blue-600 border-blue-200',
  fest: 'bg-purple-500/10 text-purple-600 border-purple-200',
  competition: 'bg-orange-500/10 text-orange-600 border-orange-200',
  seminar: 'bg-green-500/10 text-green-600 border-green-200',
  cultural: 'bg-pink-500/10 text-pink-600 border-pink-200',
  sports: 'bg-red-500/10 text-red-600 border-red-200',
  tech: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
  other: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

const statusColors: Record<EventStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  approved: 'bg-green-500/10 text-green-600',
  rejected: 'bg-red-500/10 text-red-600',
  upcoming: 'bg-blue-500/10 text-blue-600',
  ongoing: 'bg-emerald-500/10 text-emerald-600',
  completed: 'bg-gray-500/10 text-gray-600',
  cancelled: 'bg-red-500/10 text-red-600',
};

export function EventCard({ event, showActions = true, onRegister, onUnregister, isRegistered }: EventCardProps) {
  const regCount = event.registration_count ?? 0;
  const spotsLeft = event.max_participants ? event.max_participants - regCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isDeadlinePassed = new Date(event.registration_deadline) < new Date();

  return (
    <Card className="card-hover overflow-hidden group">
      <div
        className="h-32 bg-gradient-to-br from-primary via-primary/80 to-accent relative overflow-hidden"
        style={event.poster_url ? { backgroundImage: `url(${event.poster_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-3 left-4 right-4">
          <Badge className={cn('border', eventTypeColors[event.event_type])}>
            {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={statusColors[event.status]}>{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</Badge>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="space-y-3">
          <div>
            <h3 className="font-display text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">{event.name}</h3>
            {event.club?.name && <p className="text-sm text-muted-foreground mt-1">by {event.club.name}</p>}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{format(new Date(event.event_date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{event.event_time}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
            {event.max_participants && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>
                  {regCount}/{event.max_participants} registered
                  {spotsLeft !== null && spotsLeft > 0 && <span className="text-success ml-1">({spotsLeft} spots left)</span>}
                  {isFull && <span className="text-destructive ml-1">(Slots full)</span>}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-5 pt-0 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/events/${event.id}`}>View Details</Link>
          </Button>
          {onRegister && !isRegistered && (
            <Button
              size="sm"
              className={cn('flex-1', 'btn-gradient')}
              disabled={isFull || isDeadlinePassed}
              onClick={() => onRegister(event.id)}
            >
              {isFull ? 'Slots full' : isDeadlinePassed ? 'Closed' : 'Register'}
            </Button>
          )}
          {isRegistered && onUnregister && (
            <Button size="sm" variant="outline" className="flex-1 border-success text-success" onClick={onUnregister}>
              Registered ✓
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
