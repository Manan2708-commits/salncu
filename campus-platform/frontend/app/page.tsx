import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { ArrowRight, Building2, Calendar, Users, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-300 mb-6">
            <Star className="w-4 h-4" /> Your campus, your community
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Discover <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Clubs</span> &{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Events</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Explore student clubs, attend exciting events, and build your campus community — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/clubs" className="btn-primary flex items-center gap-2 justify-center text-base px-8 py-3">
              Explore Clubs <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/events" className="btn-outline flex items-center gap-2 justify-center text-base px-8 py-3">
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: 'Join Clubs', desc: 'Find clubs that match your interests and connect with like-minded students.', color: 'text-indigo-400' },
              { icon: Calendar, title: 'Attend Events', desc: 'Never miss an event — workshops, fests, competitions and more.', color: 'text-purple-400' },
              { icon: Users, title: 'Build Community', desc: 'Start your own club and grow a community around your passion.', color: 'text-pink-400' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card text-center">
                <Icon className={`w-10 h-10 mx-auto mb-4 ${color}`} />
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center glass-card">
          <h2 className="text-3xl font-bold mb-4">Want to start a club?</h2>
          <p className="text-gray-400 mb-6">Submit a club registration request and our admin team will review it.</p>
          <Link href="/club-request" className="btn-primary inline-flex items-center gap-2">
            Register Your Club <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
