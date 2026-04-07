import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, ClipboardList, Camera, Mic, Link, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: typeof Camera;
  completed: boolean;
  action?: string;
  href?: string;
}

const onboardingChecklist: ChecklistItem[] = [
  { id: 'intake', label: 'Complete Strategy Intake Form', description: 'Tell us about your business, goals, and ideal customers', icon: FileText, completed: true, action: 'Completed' },
  { id: 'photo', label: 'Upload Clone Photo', description: 'A high-quality headshot for your AI avatar', icon: Camera, completed: true, action: 'Completed' },
  { id: 'recording', label: 'Record HeyGen Clone Video', description: 'Follow our recording guide to create your AI presenter', icon: Mic, completed: false, action: 'Start Recording', href: '/portal/brand' },
  { id: 'social', label: 'Connect Social Media Accounts', description: 'Connect your Instagram, Facebook, and other accounts to GoHighLevel', icon: Link, completed: false, action: 'Connect Accounts' },
  { id: 'brand', label: 'Upload Brand Assets', description: 'Logos, colors, fonts, and any existing marketing materials', icon: ClipboardList, completed: false, action: 'Upload Assets', href: '/portal/brand' },
  { id: 'call', label: 'Schedule Onboarding Call', description: 'Book a 30-minute call to review your 60-90 day strategy', icon: Calendar, completed: false, action: 'Book Call' },
];

export default function PortalOnboarding() {
  const completedCount = onboardingChecklist.filter(i => i.completed).length;
  const progressPercent = Math.round((completedCount / onboardingChecklist.length) * 100);

  return (
    <AppLayout>
      <header className="flex items-center justify-between h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Onboarding</h1>
        <span className="text-xs text-muted-foreground font-mono">
          {completedCount}/{onboardingChecklist.length} complete
        </span>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin">
        {/* Progress Bar */}
        <div className="rounded-lg bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Getting You Set Up</h3>
            <span className="text-xs font-mono text-accent">{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Complete all steps to activate your full service. We'll start producing content once everything is ready.
          </p>
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          {onboardingChecklist.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg bg-card border transition-colors',
                  item.completed ? 'border-success/20 bg-success/5' : 'border-border/50 hover:border-border'
                )}
              >
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                )}
                <Icon className={cn('h-4 w-4 shrink-0', item.completed ? 'text-success/60' : 'text-muted-foreground')} />
                <div className="flex-1 min-w-0">
                  <h4 className={cn('text-sm font-medium', item.completed && 'line-through text-muted-foreground')}>
                    {item.label}
                  </h4>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                {item.action && !item.completed && (
                  <Button size="sm" variant="outline" className="shrink-0 text-xs h-7">
                    {item.action}
                  </Button>
                )}
                {item.completed && (
                  <span className="text-xs text-success font-medium shrink-0">Done</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
