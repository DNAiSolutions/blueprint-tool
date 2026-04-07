import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch, href: '/pipeline' },
  { id: 'content', label: 'Content', icon: Film, href: '/content' },
  { id: 'websites', label: 'Websites', icon: Globe, href: '/websites' },
  { id: 'leads', label: 'Leads', icon: Radio, href: '/leads' },
  { id: 'ai', label: 'AI Command', icon: Bot, href: '/ai' },
  { id: 'finances', label: 'Finances', icon: DollarSign, href: '/finances' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAdmin, role } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 border-r transition-all duration-300',
        'bg-[hsl(220,30%,8%)] border-[hsl(220,20%,15%)]',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-[hsl(220,20%,15%)]',
        collapsed ? 'justify-center px-2' : 'px-5'
      )}>
        {collapsed ? (
          <span className="text-sm font-black tracking-tighter text-accent">DD</span>
        ) : (
          <div>
            <span className="text-base font-black tracking-tighter text-accent uppercase">DigitalDNA</span>
            <span className="block text-[10px] font-mono text-muted-foreground tracking-widest uppercase">AI OS v1.0</span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-[hsl(210,15%,65%)] hover:bg-[hsl(220,20%,13%)] hover:text-foreground border border-transparent',
                collapsed && 'justify-center px-0'
              )}
            >
              <Icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-accent')} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 py-2 border-t border-[hsl(220,20%,15%)]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-[hsl(210,15%,50%)] hover:text-foreground hover:bg-[hsl(220,20%,13%)] transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
        </button>
      </div>

      {/* User */}
      <div className={cn(
        'border-t border-[hsl(220,20%,15%)] p-3',
        collapsed && 'flex flex-col items-center gap-2'
      )}>
        <div className={cn('flex items-center gap-3', collapsed && 'flex-col')}>
          <Avatar className="h-8 w-8 ring-1 ring-accent/30">
            <AvatarFallback className="bg-accent/20 text-accent text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-[10px] font-mono text-accent/70 uppercase tracking-wider flex items-center gap-1">
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
