import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Film, Globe, Calendar, Heart, Bell, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function PortalDashboard() {
  const { clientRecord } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const recentNotifications = notifications.slice(0, 5);

  return (
    <AppLayout>
      <header className="flex items-center justify-between h-14 border-b border-border px-6 shrink-0">
        <div>
          <h1 className="text-lg font-bold">Welcome back{clientRecord ? `, ${clientRecord.business_name}` : ''}</h1>
          <p className="text-xs text-muted-foreground">Here's what's happening with your services</p>
        </div>
        {clientRecord && <StatusBadge status={clientRecord.status || 'active'} />}
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Content Status" value="7" subtitle="pieces this week" icon={Film} />
          <KPICard label="Website" value="Live" subtitle="Last updated 2 days ago" icon={Globe} />
          <KPICard label="Next Post" value="Tue" subtitle="9:00 AM — Instagram" icon={Calendar} />
          <KPICard label="Health Score" value="84" subtitle="Growing steadily" icon={Heart} trend={{ value: '+6%', positive: true }} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Content Pending Approval */}
          <div className="col-span-2 rounded-lg bg-card p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Film className="h-4 w-4 text-accent" />
              Content Awaiting Your Approval
            </h3>
            <div className="space-y-2">
              {[
                { title: 'Mon — "3 things your driveway is begging you to do"', status: 'pending', days: 3 },
                { title: 'Tue — "Your neighbors hired us. Here\'s what happened."', status: 'pending', days: 2 },
                { title: 'Wed — "The $200 mistake every homeowner makes"', status: 'approved', days: 0 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-md bg-background border border-border/50">
                  {item.status === 'approved' ? (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-warning shrink-0" />
                  )}
                  <span className="flex-1 text-xs">{item.title}</span>
                  <StatusBadge status={item.status} />
                  {item.status === 'pending' && (
                    <span className="text-[10px] text-muted-foreground">Auto-approves in {5 - item.days}d</span>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => navigate('/portal/content')}>
              View all content <ArrowRight className="h-3 w-3" />
            </Button>
          </div>

          {/* Notifications */}
          <div className="rounded-lg bg-card p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-accent" />
              Notifications
              {unreadCount > 0 && (
                <span className="h-4 min-w-[16px] px-1 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </h3>
            {recentNotifications.length > 0 ? (
              <div className="space-y-2">
                {recentNotifications.map(n => (
                  <div key={n.id} className="p-2 rounded-md bg-background border border-border/50">
                    <p className="text-xs font-medium">{n.title}</p>
                    <p className="text-[10px] text-muted-foreground">{n.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No new notifications</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
