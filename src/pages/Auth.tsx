import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, isLoading, isAuthenticated, primaryRole, init, initialized } = useAuthStore();
  const { toast } = useToast();

  const initialMode = (searchParams.get('mode') as 'login' | 'signup') || 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  // Track whether the current auth action was a login (should redirect) or signup (stay)
  const [justSignedUp, setJustSignedUp] = useState(false);

  useEffect(() => { if (!initialized) init(); }, [initialized, init]);

  // Redirect if already authenticated when landing on this page (e.g. back button)
  useEffect(() => {
    if (isAuthenticated && primaryRole && !justSignedUp) {
      const path = primaryRole === 'admin' ? '/admin' : primaryRole === 'club_admin' ? '/club-admin' : '/student';
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, primaryRole, navigate, justSignedUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const { error } = await signIn(formData.email, formData.password);
      if (error) return toast({ title: 'Sign in failed', description: error, variant: 'destructive' });
      const role = useAuthStore.getState().primaryRole;
      const path = role === 'admin' ? '/admin' : role === 'club_admin' ? '/club-admin' : '/student';
      toast({ title: 'Welcome back!' });
      navigate(path, { replace: true });
    } else {
      if (!formData.name.trim()) return toast({ title: 'Name required', variant: 'destructive' });
      if (formData.password.length < 6) return toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      setJustSignedUp(true);
      const { error } = await signUp(formData.name, formData.email, formData.password);
      if (error) {
        setJustSignedUp(false);
        return toast({ title: 'Sign up failed', description: error, variant: 'destructive' });
      }
      toast({ title: 'Account created!', description: 'You can now explore events as a student.' });
      navigate('/student', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <Link to="/home" className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
              <GraduationCap className="w-8 h-8" />
            </div>
            <span className="font-display text-3xl font-bold">CampusEvents</span>
          </Link>
          <h1 className="font-display text-4xl font-bold mb-4">
            {mode === 'login' ? 'Welcome Back!' : 'Join the Community'}
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            {mode === 'login'
              ? 'Sign in to discover events and stay connected with campus life.'
              : 'Create a student account to register for events. Club admin and admin access is granted by your college authority.'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/home" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">CampusEvents</span>
          </Link>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-display text-2xl">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </CardTitle>
              <CardDescription>
                {mode === 'login' ? 'Enter your credentials to continue' : 'New accounts join as students by default'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <TabsContent value="signup" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required={mode === 'signup'} maxLength={100} />
                    </div>
                  </TabsContent>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@college.edu" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} required maxLength={255} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
                  </div>

                  <Button type="submit" className="w-full btn-gradient" disabled={isLoading}>
                    {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Please wait...</>) : (mode === 'login' ? 'Sign In' : 'Create Account')}
                  </Button>
                </form>
              </Tabs>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-primary font-medium hover:underline">
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
