import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus, ArrowLeft, Edit, Key } from "lucide-react";

interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  description: string | null;
  created_at: string;
  is_admin: boolean;
  is_active: boolean;
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserDescription, setNewUserDescription] = useState("");
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [changingPasswordUser, setChangingPasswordUser] = useState<UserWithRole | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [deletingUser, setDeletingUser] = useState<UserWithRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setCurrentUser(session.user);

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Access denied",
          description: "You do not have permission to access this page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadData();
    };

    checkAdmin();
  }, [navigate, toast]);

  const loadData = async () => {
    setLoading(true);

    // Load profiles with roles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        user_id,
        email,
        description,
        created_at,
        is_active
      `);

    if (profilesError) {
      toast({
        title: "Error loading users",
        description: profilesError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Load roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("user_id, role");

    // Combine profiles with roles
    const usersWithRoles = profilesData?.map((profile) => {
      const userRole = rolesData?.find((r) => r.user_id === profile.user_id);
      return {
        ...profile,
        is_admin: userRole?.role === "admin",
      };
    }) || [];

    setUsers(usersWithRoles);

    // Load system settings
    const { data: settingsData } = await supabase
      .from("system_settings")
      .select("registration_enabled")
      .single();

    if (settingsData) {
      setRegistrationEnabled(settingsData.registration_enabled);
    }

    setLoading(false);
  };

  const handleToggleRegistration = async (enabled: boolean) => {
    const { error } = await supabase
      .from("system_settings")
      .update({ registration_enabled: enabled })
      .eq("id", (await supabase.from("system_settings").select("id").single()).data?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
      return;
    }

    setRegistrationEnabled(enabled);
    toast({
      title: "Settings saved",
      description: enabled ? "Self-registration is enabled" : "Self-registration is disabled",
    });
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: "Error",
        description: "Please fill in email and password",
        variant: "destructive",
      });
      return;
    }

    if (newUserPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You are not logged in",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.functions.invoke('create-user', {
      body: {
        email: newUserEmail,
        password: newUserPassword,
        isAdmin: newUserIsAdmin,
        description: newUserDescription || null,
      },
    });

    setLoading(false);

    if (error) {
      if (isLocalDev) {
        toast({
          title: "Edge Functions unavailable",
          description: "For local dev, create users via Supabase Studio (localhost:54323) → Authentication → Add User",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "User was successfully created",
    });

    setIsAddUserOpen(false);
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserDescription("");
    setNewUserIsAdmin(false);
    loadData();
  };

  const handleDeleteUser = async (user: UserWithRole) => {
    if (user.user_id === currentUser?.id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    if (user.email === 'admin@admin.local') {
      toast({
        title: "Error",
        description: "Cannot delete main administrator account",
        variant: "destructive",
      });
      return;
    }

    // Open confirmation dialog
    setDeletingUser(user);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You are not logged in",
        variant: "destructive",
      });
      setIsDeleting(false);
      return;
    }

    const { error } = await supabase.functions.invoke('delete-user', {
      body: {
        userId: deletingUser.user_id,
      },
    });

    setIsDeleting(false);

    if (error) {
      if (isLocalDev) {
        const sqlCommand = `DELETE FROM auth.users WHERE id = '${deletingUser.user_id}';`;
        toast({
          title: "Edge Functions unavailable",
          description: "Run this SQL in Supabase Studio (localhost:54323): " + sqlCommand,
          variant: "destructive",
        });
        navigator.clipboard.writeText(sqlCommand);
        return;
      }
      toast({
        title: "Error deleting",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "User and all their data has been deleted",
    });

    setDeletingUser(null);
    loadData();
  };

  const handleEditDescription = (user: UserWithRole) => {
    setEditingUser(user);
    setEditDescription(user.description || "");
  };

  const handleSaveDescription = async () => {
    if (!editingUser) return;

    const { error } = await supabase
      .from("profiles")
      .update({ description: editDescription })
      .eq("user_id", editingUser.user_id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save description",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Saved",
      description: "Account description was updated",
    });

    setEditingUser(null);
    setEditDescription("");
    loadData();
  };

  const handleChangePassword = (user: UserWithRole) => {
    setChangingPasswordUser(user);
    setNewPassword("");
  };

  const isLocalDev = import.meta.env.VITE_SUPABASE_PROJECT_ID === "local";

  const handleSavePassword = async () => {
    if (!changingPasswordUser || !newPassword) {
      toast({
        title: "Error",
        description: "Enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You are not logged in",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.functions.invoke('change-user-password', {
      body: {
        userId: changingPasswordUser.user_id,
        newPassword: newPassword,
      },
    });

    if (error) {
      // For local development, show SQL command as fallback
      if (isLocalDev) {
        const sqlCommand = `UPDATE auth.users SET encrypted_password = crypt('${newPassword}', gen_salt('bf')) WHERE id = '${changingPasswordUser.user_id}';`;
        toast({
          title: "Edge Functions unavailable",
          description: "Run this SQL in Supabase Studio (localhost:54323): " + sqlCommand,
          variant: "destructive",
        });
        navigator.clipboard.writeText(sqlCommand);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to change password: " + error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Password was changed",
    });

    setChangingPasswordUser(null);
    setNewPassword("");
  };

  const handleToggleUserAccess = async (user: UserWithRole) => {
    if (user.email === 'admin@admin.local' && user.is_active) {
      toast({
        title: "Error",
        description: "Cannot disable main administrator account",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You are not logged in",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.functions.invoke('toggle-user-access', {
      body: {
        userId: user.user_id,
        isActive: !user.is_active,
      },
    });

    if (error) {
      if (isLocalDev) {
        const newStatus = !user.is_active;
        const sqlCommand = `UPDATE public.profiles SET is_active = ${newStatus} WHERE user_id = '${user.user_id}';`;
        toast({
          title: "Edge Functions unavailable",
          description: "Run this SQL in Supabase Studio (localhost:54323): " + sqlCommand,
          variant: "destructive",
        });
        navigator.clipboard.writeText(sqlCommand);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to change access: " + error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: user.is_active ? "Access was disabled" : "Access was enabled",
    });

    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Administration</h1>
        </div>

        {/* Registration Toggle */}
        <div className="bg-card rounded-lg p-6 mb-8 border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Self-registration</h2>
              <p className="text-sm text-muted-foreground">
                Enable or disable new user registration on the login page
              </p>
            </div>
            <Switch
              checked={registrationEnabled}
              onCheckedChange={handleToggleRegistration}
            />
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add new user</DialogTitle>
                  <DialogDescription>
                    Create a new user account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Input
                      id="description"
                      type="text"
                      value={newUserDescription}
                      onChange={(e) => setNewUserDescription(e.target.value)}
                      placeholder="e.g. Marketing manager"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="admin"
                      checked={newUserIsAdmin}
                      onCheckedChange={setNewUserIsAdmin}
                    />
                    <Label htmlFor="admin">Administrator</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsAddUserOpen(false);
                    setNewUserEmail("");
                    setNewUserPassword("");
                    setNewUserDescription("");
                    setNewUserIsAdmin(false);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser} disabled={loading}>
                    {loading ? "Creating..." : "Add"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell className="max-w-xs">
                    {user.description || (
                      <span className="text-muted-foreground italic">No description</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        User
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.is_active}
                        onCheckedChange={() => handleToggleUserAccess(user)}
                        disabled={user.email === 'admin@admin.local'}
                      />
                      <span className="text-sm text-muted-foreground">
                        {user.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleChangePassword(user)}
                        title="Change password"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditDescription(user)}
                        title="Edit description"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.user_id === currentUser?.id || user.email === 'admin@admin.local'}
                        title={
                          user.user_id === currentUser?.id 
                            ? "You cannot delete your own account" 
                            : user.email === 'admin@admin.local'
                            ? "Main admin account cannot be deleted"
                            : "Delete user"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Description Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit account description</DialogTitle>
              <DialogDescription>
                Edit description for user {editingUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter account description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDescription}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={!!changingPasswordUser} onOpenChange={(open) => !open && setChangingPasswordUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change password</DialogTitle>
              <DialogDescription>
                Change password for user {changingPasswordUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  minLength={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setChangingPasswordUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleSavePassword}>Change password</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Dialog */}
        <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete user account?</DialogTitle>
              <DialogDescription className="space-y-2 pt-4">
                <p className="font-semibold">
                  Are you sure you want to delete the account for <span className="text-foreground">{deletingUser?.email}</span>?
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mt-4">
                  <p className="text-sm font-medium text-destructive mb-2">⚠️ Warning:</p>
                  <p className="text-sm text-muted-foreground">
                    This action is <strong>irreversible</strong> and will delete:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>User account</li>
                    <li>All categories</li>
                    <li>All links in all categories</li>
                    <li>User settings</li>
                  </ul>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete all"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
