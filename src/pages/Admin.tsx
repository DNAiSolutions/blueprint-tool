import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Shield, User, Users, RefreshCw, Loader2 } from 'lucide-react';
import dnaiLogo from '@/assets/dnai-logo.png';

type AppRole = 'admin' | 'rep';

interface UserWithRole {
  user_id: string;
  full_name: string | null;
  created_at: string;
  role: AppRole;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch profiles with their roles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, created_at');

    if (profilesError) {
      toast({
        variant: 'destructive',
        title: 'Error fetching users',
        description: profilesError.message,
      });
      setLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      toast({
        variant: 'destructive',
        title: 'Error fetching roles',
        description: rolesError.message,
      });
      setLoading(false);
      return;
    }

    // Combine profiles with roles
    const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.user_id);
      return {
        user_id: profile.user_id,
        full_name: profile.full_name,
        created_at: profile.created_at,
        role: (userRole?.role as AppRole) || 'rep',
      };
    });

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    // Prevent changing own role
    if (userId === user?.id) {
      toast({
        variant: 'destructive',
        title: 'Cannot change your own role',
        description: 'You cannot modify your own administrator privileges.',
      });
      return;
    }

    setUpdatingUserId(userId);

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error updating role',
        description: error.message,
      });
    } else {
      toast({
        title: 'Role updated',
        description: `User role has been changed to ${newRole}.`,
      });
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );
    }

    setUpdatingUserId(null);
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={dnaiLogo} alt="DNAi Solutions" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">User Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1.5">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Admin</span>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl p-6">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Administrators
              </CardTitle>
              <Shield className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {users.filter((u) => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sales Reps
              </CardTitle>
              <User className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {users.filter((u) => u.role === 'rep').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage user roles and permissions for your ALIGN team.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No users found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(userData.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {userData.full_name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {userData.user_id === user?.id && '(You)'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(userData.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={userData.role === 'admin' ? 'default' : 'secondary'}
                          className={
                            userData.role === 'admin'
                              ? 'bg-accent text-accent-foreground'
                              : ''
                          }
                        >
                          {userData.role === 'admin' ? (
                            <Shield className="mr-1 h-3 w-3" />
                          ) : (
                            <User className="mr-1 h-3 w-3" />
                          )}
                          {userData.role === 'admin' ? 'Admin' : 'Rep'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {userData.user_id === user?.id ? (
                          <span className="text-sm text-muted-foreground">—</span>
                        ) : (
                          <Select
                            value={userData.role}
                            onValueChange={(value) =>
                              handleRoleChange(userData.user_id, value as AppRole)
                            }
                            disabled={updatingUserId === userData.user_id}
                          >
                            <SelectTrigger className="w-32">
                              {updatingUserId === userData.user_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rep">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Rep
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  Admin
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
