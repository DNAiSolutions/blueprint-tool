import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, User } from 'lucide-react';
import dnaiLogo from '@/assets/dnai-logo.png';

const Index = () => {
  const { user, role, signOut, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <img src={dnaiLogo} alt="DNAi Solutions" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">ALIGN</h1>
              <p className="text-xs text-muted-foreground">Automation Builder</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Role Badge */}
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
              {isAdmin ? (
                <Shield className="h-4 w-4 text-accent" />
              ) : (
                <User className="h-4 w-4 text-primary" />
              )}
              <span className="text-sm font-medium capitalize text-foreground">
                {role || 'User'}
              </span>
            </div>

            {/* User Info */}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? 'Administrator' : 'Sales Representative'}
              </p>
            </div>

            {/* Sign Out */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Blueprint Canvas Area */}
      <main className="flex flex-1 items-center justify-center p-6" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="text-4xl">🎯</span>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Welcome to ALIGN</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            Your live whiteboard canvas for mapping business processes and quantifying revenue leakage.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button className="gradient-primary text-white">
              Start New Session
            </Button>
            {isAdmin && (
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Admin Panel
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
