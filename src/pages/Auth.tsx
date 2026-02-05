import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import { GraduationCap, Shield, Building2, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const roleInfo = {
  student: {
    icon: Users,
    title: 'Student',
    description: 'Browse and register for events',
  },
  club_admin: {
    icon: Building2,
    title: 'Club Admin',
    description: 'Manage your club and events',
  },
  admin: {
    icon: Shield,
    title: 'Admin',
    description: 'Oversee all clubs and events',
  },
};

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup, isLoading } = useAuthStore();
  const { toast } = useToast();
  
  const initialMode = searchParams.get('mode') || 'login';
  const initialRole = (searchParams.get('role') as UserRole) || 'student';
  
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode as 'login' | 'signup');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = false;
    
    if (mode === 'login') {
      success = await login(formData.email, formData.password, selectedRole);
    } else {
      success = await signup(formData.name, formData.email, formData.password, selectedRole);
    }

    if (success) {
      toast({
        title: mode === 'login' ? 'Welcome back!' : 'Account created!',
        description: 'Redirecting to your dashboard...',
      });
      
      // Redirect based on role
      const redirectPath = {
        admin: '/admin',
        club_admin: '/club-admin',
        student: '/student',
      }[selectedRole];
      
      navigate(redirectPath);
    } else {
      toast({
        title: 'Error',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-3 mb-12">
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
              ? 'Sign in to discover events, register for activities, and stay connected with campus life.'
              : 'Create your account to start exploring events, joining clubs, and making the most of your campus experience.'}
          </p>

          {/* Decorative elements */}
          <div className="absolute bottom-12 left-12 right-12">
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm animate-float"
                  style={{ animationDelay: `${i * 0.5}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
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
                {mode === 'login' 
                  ? 'Enter your credentials to access your account'
                  : 'Fill in your details to get started'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Role Selection */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">Select Your Role</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(roleInfo) as UserRole[]).map((role) => {
                      const info = roleInfo[role];
                      const Icon = info.icon;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
                            selectedRole === role
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mx-auto mb-1 ${
                            selectedRole === role ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <p className={`text-xs font-medium ${
                            selectedRole === role ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {info.title}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <TabsContent value="signup" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required={mode === 'signup'}
                      />
                    </div>
                  </TabsContent>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@college.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-gradient"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Please wait...
                      </>
                    ) : (
                      mode === 'login' ? 'Sign In' : 'Create Account'
                    )}
                  </Button>
                </form>
              </Tabs>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-primary font-medium hover:underline"
                  >
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
