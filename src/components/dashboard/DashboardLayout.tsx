import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  LogOut,
  Shield,
  User,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Workflow,
  Settings,
  Users,
  Search,
} from 'lucide-react';
import dnaiLogo from '@/assets/dnai-logo.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  adminOnly?: boolean;
  children?: { id: string; label: string; href: string; adminOnly?: boolean }[];
};

const navItems: NavItem[] = [
  {
    id: 'automation-builder',
    label: 'Automation Builder',
    icon: Workflow,
    href: '/',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    children: [
      { id: 'users', label: 'Users', href: '/settings/users', adminOnly: true },
    ],
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signOut, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(['settings']);

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const isActive = (href: string) => location.pathname === href;

  const isParentActive = (item: NavItem) => {
    if (item.href) return isActive(item.href);
    return item.children?.some((child) => isActive(child.href));
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - Dark Navy Per PRD */}
      <aside
        className={cn(
          'flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {/* Logo & Collapse Toggle */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img src={dnaiLogo} alt="DNAi Solutions" className="h-8 w-auto" />
            </div>
          )}
          {collapsed && (
            <img src={dnaiLogo} alt="DNAi" className="h-7 w-auto mx-auto" />
          )}
          <Button
            variant="subtle"
            size="icon-sm"
            className={cn(
              'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-muted',
              collapsed && 'hidden'
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* User Profile Section */}
        <div className={cn('p-4 border-b border-sidebar-border', collapsed && 'px-2 py-4')}>
          <div className={cn('flex items-center gap-3', collapsed && 'flex-col')}>
            <Avatar className={cn(
              'ring-2 ring-accent/30 transition-all',
              collapsed ? 'h-10 w-10' : 'h-11 w-11'
            )}>
              <AvatarFallback className="bg-accent/20 text-accent font-semibold text-sm">
                {getInitials(user?.user_metadata?.full_name, user?.email)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {displayName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isAdmin ? (
                    <Shield className="h-3 w-3 text-accent" />
                  ) : (
                    <User className="h-3 w-3 text-accent" />
                  )}
                  <span className="text-xs text-sidebar-foreground/60 capitalize">
                    {role || 'User'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search (collapsed shows icon only) */}
        {!collapsed && (
          <div className="p-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-muted text-sidebar-foreground/50 text-sm">
              <Search className="h-4 w-4" />
              <span>Search...</span>
            </div>
          </div>
        )}

        {/* Navigation Label */}
        {!collapsed && (
          <div className="px-4 pt-2 pb-1">
            <span className="text-[11px] font-medium text-sidebar-foreground/40 uppercase tracking-wider">
              Menu
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn('flex-1 px-2 space-y-1', collapsed && 'px-2')}>
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;

            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus.includes(item.id);
            const parentActive = isParentActive(item);

            const visibleChildren = item.children?.filter(
              (child) => !child.adminOnly || isAdmin
            );

            if (hasChildren && visibleChildren && visibleChildren.length > 0) {
              return (
                <Collapsible
                  key={item.id}
                  open={isOpen && !collapsed}
                  onOpenChange={() => !collapsed && toggleMenu(item.id)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        parentActive
                          ? 'bg-accent/15 text-accent'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-sidebar-foreground',
                        collapsed && 'justify-center px-2'
                      )}
                    >
                      <Icon className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        parentActive ? 'text-accent' : 'group-hover:text-accent'
                      )} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform duration-200',
                              isOpen && 'rotate-180'
                            )}
                          />
                        </>
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1">
                    {visibleChildren.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => navigate(child.href)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg py-2 pl-11 pr-3 text-sm transition-all duration-200',
                          isActive(child.href)
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-muted hover:text-sidebar-foreground'
                        )}
                      >
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => item.href && navigate(item.href)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive(item.href || '')
                    ? 'bg-accent text-accent-foreground shadow-level-1'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-sidebar-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isActive(item.href || '') ? '' : 'group-hover:text-accent'
                )} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="subtle"
            className={cn(
              'w-full gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-muted justify-start',
              collapsed && 'justify-center px-2'
            )}
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>

        {/* Collapse Toggle at Bottom */}
        {collapsed && (
          <div className="border-t border-sidebar-border p-3">
            <Button
              variant="subtle"
              size="icon-sm"
              className="w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-muted"
              onClick={() => setCollapsed(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
