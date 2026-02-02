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

  const getInitials = (email: string | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo & Collapse */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img src={dnaiLogo} alt="DNAi" className="h-8 w-auto" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            />
          </Button>
        </div>

        {/* User Info */}
        <div className={cn('border-b border-border p-4', collapsed && 'flex justify-center')}>
          <div className={cn('flex items-center gap-3', collapsed && 'flex-col')}>
            <Avatar className="h-10 w-10 border-2 border-primary/30">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(user?.email)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-1.5">
                  {isAdmin ? (
                    <Shield className="h-3 w-3 text-accent" />
                  ) : (
                    <User className="h-3 w-3 text-primary" />
                  )}
                  <span className="text-xs text-muted-foreground capitalize">
                    {role || 'User'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            // Skip admin-only items for non-admins
            if (item.adminOnly && !isAdmin) return null;

            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus.includes(item.id);
            const parentActive = isParentActive(item);

            // Filter children for admin-only items
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
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        'hover:bg-secondary/80',
                        parentActive
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground',
                        collapsed && 'justify-center'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform',
                              isOpen && 'rotate-180'
                            )}
                          />
                        </>
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4">
                    {visibleChildren.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => navigate(child.href)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          'hover:bg-secondary/80',
                          isActive(child.href)
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground'
                        )}
                      >
                        <ChevronRight className="h-4 w-4" />
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
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-secondary/80',
                  isActive(item.href || '')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground',
                  collapsed && 'justify-center'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            className={cn(
              'w-full gap-3 text-muted-foreground hover:text-foreground',
              collapsed && 'justify-center px-0'
            )}
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
