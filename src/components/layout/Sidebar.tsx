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
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shield,
  Bell,
  Users,
  FolderKanban,
  DollarSign,
  // Portal icons
  Palette,
  GraduationCap,
  CreditCard,
  Star,
  ClipboardList,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard | null;
  href: string;
  children?: { id: string; label: string; href: string }[];
}

// Admin/rep navigation — consolidated with nested sub-pages
const adminNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch, href: '/pipeline' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, href: '/projects' },
  { id: 'content', label: 'Content', icon: Film, href: '/content' },
  { id: 'websites', label: 'Websites', icon: Globe, href: '/websites' },
  { id: 'leads', label: 'Leads', icon: Radio, href: '/leads' },
  { id: 'ai', label: 'AI Command', icon: Bot, href: '/ai' },
  { id: 'finances', label: 'Finances', icon: DollarSign, href: '/finances' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings',
    children: [
      { id: 'settings-users', label: 'Users', href: '/settings/users' },
      { id: 'settings-automations', label: 'Automations', href: '/settings/automations' },
      { id: 'settings-canvas', label: 'Canvas', href: '/settings/canvas' },
      { id: 'settings-health', label: 'Client Health', href: '/clients/health' },
      { id: 'settings-costs', label: 'Cost Ledger', href: '/clients/costs' },
      { id: 'settings-templates', label: 'Templates', href: '/clients/templates' },
      { id: 'settings-webhooks', label: 'Webhooks', href: '/clients/webhooks' },
    ],
  },
];

// Client portal navigation
const clientNav: NavItem[] = [
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
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

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Auto-expand section if a child route is active
  const isChildActive = (item: NavItem) =>
    item.children?.some(child => location.pathname.startsWith(child.href)) ?? false;

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
          if (item.icon === null) {
            return collapsed ? null : (
              <div key={item.id} className="my-2 mx-3 h-px bg-[hsl(var(--ghost-border)/0.15)]" />
            );
          }

          const Icon = item.icon!;
          const active = isActive(item.href) && !item.children;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedSections.has(item.id) || isChildActive(item);

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (hasChildren && !collapsed) {
                    toggleSection(item.id);
                    // Also navigate to the parent route
                    navigate(item.href);
                  } else {
                    navigate(item.href);
                  }
                }}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  active || (hasChildren && isChildActive(item))
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-[hsl(var(--surface-high))] hover:text-foreground',
                  collapsed && 'justify-center px-0'
                )}
              >
                <Icon className={cn('h-[18px] w-[18px] shrink-0', (active || isChildActive(item)) && 'text-primary')} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {hasChildren && (
                      <ChevronDown className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )} />
                    )}
                  </>
                )}
              </button>

              {/* Nested children */}
              {hasChildren && isExpanded && !collapsed && (
                <div className="ml-4 pl-3 border-l border-[hsl(var(--ghost-border)/0.12)] space-y-0.5 mt-0.5 mb-1">
                  {item.children!.map(child => {
                    const childActive = isActive(child.href);
                    return (
                      <button
                        key={child.id}
                        onClick={() => navigate(child.href)}
                        className={cn(
                          'flex w-full items-center rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                          childActive
                            ? 'text-primary bg-primary/5'
                            : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--surface-high))]'
                        )}
                      >
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
