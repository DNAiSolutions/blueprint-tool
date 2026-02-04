import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, ArrowRight, Target } from 'lucide-react';
import dnaiLogo from '@/assets/dnai-logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInErrors, setSignInErrors] = useState<{ email?: string; password?: string }>({});

  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpErrors, setSignUpErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInErrors({});

    const emailResult = emailSchema.safeParse(signInEmail);
    const passwordResult = passwordSchema.safeParse(signInPassword);

    const errors: { email?: string; password?: string } = {};
    if (!emailResult.success) errors.email = emailResult.error.errors[0].message;
    if (!passwordResult.success) errors.password = passwordResult.error.errors[0].message;

    if (Object.keys(errors).length > 0) {
      setSignInErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(signInEmail, signInPassword);
    setIsSubmitting(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      navigate('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpErrors({});

    const emailResult = emailSchema.safeParse(signUpEmail);
    const passwordResult = passwordSchema.safeParse(signUpPassword);
    const nameResult = nameSchema.safeParse(signUpName);

    const errors: { email?: string; password?: string; name?: string } = {};
    if (!nameResult.success) errors.name = nameResult.error.errors[0].message;
    if (!emailResult.success) errors.email = emailResult.error.errors[0].message;
    if (!passwordResult.success) errors.password = passwordResult.error.errors[0].message;

    if (Object.keys(errors).length > 0) {
      setSignUpErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(signUpEmail, signUpPassword, signUpName);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          variant: 'destructive',
          title: 'Account already exists',
          description: 'This email is already registered. Please sign in instead.',
        });
        setActiveTab('signin');
        setSignInEmail(signUpEmail);
      } else {
        toast({
          variant: 'destructive',
          title: 'Sign up failed',
          description: error.message,
        });
      }
    } else {
      toast({
        title: 'Account created!',
        description: 'Please check your email to confirm your account.',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-sidebar p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative z-10">
          <img src={dnaiLogo} alt="DNAi Solutions" className="h-12 w-auto" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-sidebar-foreground">ALIGN</h1>
              <p className="text-sidebar-foreground/60">Automation Builder</p>
            </div>
          </div>
          
          <p className="text-xl text-sidebar-foreground/80 max-w-md leading-relaxed">
            Map your business processes. Quantify revenue leakage. Close deals with undeniable data.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-sidebar-foreground/70">Real-time process mapping</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-sidebar-foreground/70">Automated leak detection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-sidebar-foreground/70">AI readiness assessment</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-sidebar-foreground/50">
            © 2026 DNAi Solutions. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex flex-col items-center">
            <img src={dnaiLogo} alt="DNAi Solutions" className="mb-4 h-12 w-auto" />
            <h1 className="text-xl font-bold text-foreground">ALIGN Automation Builder</h1>
          </div>

          {/* Auth Card */}
          <Card className="border-border/50 shadow-level-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')}>
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2 bg-muted">
                  <TabsTrigger 
                    value="signin"
                    className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                {/* Sign In Form */}
                <TabsContent value="signin" className="mt-0">
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <CardDescription className="mb-5">
                      Welcome back! Sign in to access your ALIGN sessions.
                    </CardDescription>

                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="you@company.com"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          className="pl-10 h-11"
                          autoComplete="email"
                        />
                      </div>
                      {signInErrors.email && (
                        <p className="text-sm text-destructive">{signInErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          className="pl-10 h-11"
                          autoComplete="current-password"
                        />
                      </div>
                      {signInErrors.password && (
                        <p className="text-sm text-destructive">{signInErrors.password}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      variant="primary"
                      className="w-full h-11"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up Form */}
                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <CardDescription className="mb-5">
                      Create your account to start using ALIGN.
                    </CardDescription>

                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Smith"
                          value={signUpName}
                          onChange={(e) => setSignUpName(e.target.value)}
                          className="pl-10 h-11"
                          autoComplete="name"
                        />
                      </div>
                      {signUpErrors.name && (
                        <p className="text-sm text-destructive">{signUpErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@company.com"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          className="pl-10 h-11"
                          autoComplete="email"
                        />
                      </div>
                      {signUpErrors.email && (
                        <p className="text-sm text-destructive">{signUpErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          className="pl-10 h-11"
                          autoComplete="new-password"
                        />
                      </div>
                      {signUpErrors.password && (
                        <p className="text-sm text-destructive">{signUpErrors.password}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      variant="primary"
                      className="w-full h-11"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you agree to DNAi Solutions' terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
