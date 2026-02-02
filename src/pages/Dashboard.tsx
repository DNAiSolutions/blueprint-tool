import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Automation Builder</h1>
            <p className="text-sm text-muted-foreground">
              Map business processes and quantify revenue leakage
            </p>
          </div>
          <Button className="gradient-primary text-white">
            + New Session
          </Button>
        </header>

        {/* Canvas Area */}
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
              <span className="text-5xl">🎯</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Welcome to ALIGN
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Your live whiteboard canvas for mapping business processes and
              quantifying revenue leakage in real-time.
            </p>
            <Button className="gradient-primary text-white">
              Start New Session
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
