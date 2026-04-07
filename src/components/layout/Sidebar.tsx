import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  GitBranch,
  Film,
  Globe,
  Radio,
  Bot,
  DollarSign,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Workflow,
  Zap,
  Bell,
  Users,
  Heart,
  Webhook,
  Receipt,
  BookTemplate,
  ClipboardList,
  // Portal icons
  Eye,
  Palette,
  GraduationCap,
  CreditCard,
  Star,
  Upload,
} from 'lucide-react';

// Admin/rep navigation
const adminNav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch, href: '/pipeline' },
  { id: 'canvas', label: 'Automation Builder', icon: Workflow, href: '/canvas' },
  { id: 'content', label: 'Content', icon: Film, href: '/content' },
  { id: 'websites', label: 'Websites', icon: Globe, href: '/websites' },
  { id: 'automations', label: 'Automations', icon: Zap, href: '/automations' },
  { id: 'leads', label: 'Leads', icon: Radio, href: '/leads' },
  { id: 'ai', label: 'AI Command', icon: Bot, href: '/ai' },
  { id: 'finances', label: 'Finances', icon: DollarSign, href: '/finances' },
  { id: 'divider-1', label: '', icon: null, href: '' },
  { id: 'onboarding', label: 'Onboarding', icon: ClipboardList, href: '/onboarding' },
  { id: 'health', label: 'Client Health', icon: Heart, href: '/health' },
  { id: 'costs', label: 'Cost Ledger', icon: Receipt, href: '/costs' },
  { id: 'templates', label: 'Templates', icon: BookTemplate, href: '/templates' },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook, href: '/webhooks' },
  { id: 'divider-2', label: '', icon: null, href: '' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

// Client portal navigation
const clientNav = [
  { id: 'portal', label: 'Dashboard', icon: LayoutDashboard, href: '/portal' },
  { id: 'portal-content', label: 'Content', icon: Film, href: '/portal/content' },
  { id: 'portal-website', label: 'My Website', icon: Globe, href: '/portal/website' },
  { id: 'portal-brand', label: 'Brand & Assets', icon: Palette, href: '/portal/brand' },
  { id: 'portal-onboarding', label: 'Onboarding', icon: ClipboardList, href: '/portal/onboarding' },
  { id: 'portal-education', label: 'Education', icon: GraduationCap, href: '/portal/education' },
  { id: 'portal-billing', label: 'Billing', icon: CreditCard, href: '/portal/billing' },
  { id: 'portal-reviews', label: 'Reviews', icon: Star, href: '/portal/reviews' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAdmin, isClient, role } = useAuth();
  const { unreadCount } = useNotifications();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const navItems = isClient ? clientNav : adminNav;

  const isActive = (href: string) => {
    if (href === '/' || href === '/portal') return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 transition-all duration-300',
        'bg-[hsl(var(--sidebar-background))]',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16',
        collapsed ? 'justify-center px-2' : 'px-5'
      )}>
        {collapsed ? (
          <span className="text-sm font-black tracking-tighter text-primary">DD</span>
        ) : (
          <div>
            <span className="text-base font-black tracking-tighter text-primary uppercase">DigitalDNA</span>
            <span className="block text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
              {isClient ? 'Client Portal' : 'AI OS v1.0'}
            </span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          // Divider
          if (item.icon === null) {
            return collapsed ? null : (
              <div key={item.id} className="my-2 mx-3 h-px bg-[hsl(var(--ghost-border)/0.15)]" />
            );
          }

          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-[hsl(var(--surface-high))] hover:text-foreground',
                collapsed && 'justify-center px-0'
              )}
            >
              <Icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-primary')} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Notification Bell */}
      <div className="px-2 py-1">
        <button
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--surface-high))] transition-colors relative',
            collapsed && 'justify-center px-0'
          )}
        >
          <Bell className="h-4 w-4" />
          {!collapsed && <span>Notifications</span>}
          {unreadCount > 0 && (
            <span className={cn(
              'flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-accent text-accent-foreground text-[9px] font-bold',
              collapsed ? 'absolute -top-0.5 -right-0.5' : 'ml-auto'
            )}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className="px-2 py-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--surface-high))] transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
        </button>
      </div>

      {/* User */}
      <div className={cn(
        'p-3',
        collapsed && 'flex flex-col items-center gap-2'
      )}>
        <div className={cn('flex items-center gap-3', collapsed && 'flex-col')}>
          <Avatar className="h-8 w-8 ring-1 ring-primary/30">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="ai-label flex items-center gap-1">
                {isAdmin && <Shield className="h-2.5 w-2.5" />}
                {role || 'user'}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={signOut}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
