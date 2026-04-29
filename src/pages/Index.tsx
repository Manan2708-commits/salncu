import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { EventCard } from '@/components/events/EventCard';
import { GraduationCap, Calendar, Users, Sparkles, ArrowRight, Trophy, Lightbulb, Music } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useClubs } from '@/hooks/useClubs';

const Index = () => {
  const { data: events = [] } = useEvents({ status: ['approved', 'upcoming', 'ongoing'] });
  const { data: clubs = [] } = useClubs({ status: ['approved'] });
  const featuredEvents = events.slice(0, 3);
  const featuredClubs = clubs.slice(0, 4);

  const stats = [
    { label: 'Active Clubs', value: `${clubs.length}+`, icon: Users },
    { label: 'Events', value: `${events.length}+`, icon: Calendar },
    { label: 'Students Engaged', value: '5000+', icon: GraduationCap },
  ];

  const features = [
    { icon: Trophy, title: 'Competitions', description: 'Hackathons, debates, and more' },
    { icon: Lightbulb, title: 'Workshops', description: 'Learn from industry experts' },
    { icon: Music, title: 'Cultural Events', description: 'Celebrate diversity through arts' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />Discover Campus Life
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Your Gateway to <span className="gradient-text">Campus Events</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover, register, and participate in events organized by clubs across campus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-gradient text-lg px-8" asChild>
                <Link to="/events">Explore Events<ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/auth?mode=signup">Sign Up</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-card border border-border/50 shadow-card">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-display font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">What's Happening on Campus</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((f) => (
              <div key={f.title} className="text-center p-8 rounded-2xl bg-card border border-border/50 card-hover">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredEvents.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold mb-2">Upcoming Events</h2>
                <p className="text-muted-foreground">Don't miss out</p>
              </div>
              <Button variant="outline" asChild><Link to="/events">View All<ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((e: any) => <EventCard key={e.id} event={e} showActions={false} />)}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Our Active Clubs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredClubs.map((club: any) => (
              <div key={club.id} className="p-6 rounded-2xl bg-card border border-border/50 card-hover text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">{club.name.charAt(0)}</span>
                </div>
                <h3 className="font-semibold mb-1">{club.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{club.member_count || 0} members</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild><Link to="/clubs">View All Clubs<ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Campus<span className="text-primary">Events</span></span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 CampusEvents</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
