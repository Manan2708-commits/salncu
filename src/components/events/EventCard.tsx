import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event, EventStatus, EventType } from '@/types';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
  onRegister?: (eventId: string) => void;
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

export function EventCard({ event, showActions = true, onRegister, isRegistered }: EventCardProps) {
  const spotsLeft = event.maxParticipants 
    ? event.maxParticipants - event.registrationCount 
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();

  return (
    <Card className="card-hover overflow-hidden group">
      {/* Event Image/Gradient Banner */}
      <div className="h-32 bg-gradient-to-br from-primary via-primary/80 to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-3 left-4 right-4">
          <Badge className={cn('border', eventTypeColors[event.eventType])}>
            {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={statusColors[event.status]}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="space-y-3">
          <div>
            <h3 className="font-display text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {event.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              by {event.clubName}
            </p>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
            {event.maxParticipants && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>
                  {event.registrationCount}/{event.maxParticipants} registered
                  {spotsLeft !== null && spotsLeft > 0 && (
                    <span className="text-success ml-1">({spotsLeft} spots left)</span>
                  )}
                  {isFull && <span className="text-destructive ml-1">(Full)</span>}
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
          {onRegister && (
            <Button 
              size="sm" 
              className={cn("flex-1", isRegistered ? "bg-success hover:bg-success/90" : "btn-gradient")}
              disabled={isFull || isDeadlinePassed || isRegistered}
              onClick={() => onRegister(event.id)}
            >
              {isRegistered ? 'Registered ✓' : isFull ? 'Full' : isDeadlinePassed ? 'Closed' : 'Register'}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
