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
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [changingPasswordUser, setChangingPasswordUser] = useState<UserWithRole | null>(null);
  const [newPassword, setNewPassword] = useState("");

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
          title: "Přístup odepřen",
          description: "Nemáte oprávnění k této stránce",
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
        created_at
      `);

    if (profilesError) {
      toast({
        title: "Chyba při načítání uživatelů",
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
        title: "Chyba",
        description: "Nepodařilo se aktualizovat nastavení",
        variant: "destructive",
      });
      return;
    }

    setRegistrationEnabled(enabled);
    toast({
      title: "Nastavení uloženo",
      description: enabled ? "Samoregistrace je povolena" : "Samoregistrace je zakázána",
    });
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: "Chyba",
        description: "Vyplňte email a heslo",
        variant: "destructive",
      });
      return;
    }

    // Create user using admin API - note: this requires service role key in edge function
    // For now, we'll show a message that this needs to be implemented via edge function
    toast({
      title: "Informace",
      description: "Přidání uživatele administrátorem bude implementováno v další verzi. Prozatím použijte samoregistraci.",
    });

    setIsAddUserOpen(false);
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserIsAdmin(false);
  };

  const handleDeleteUser = async (user: UserWithRole) => {
    if (user.user_id === currentUser?.id) {
      toast({
        title: "Chyba",
        description: "Nemůžete smazat svůj vlastní účet",
        variant: "destructive",
      });
      return;
    }

    if (user.email === 'admin@admin.local') {
      toast({
        title: "Chyba",
        description: "Nelze smazat hlavní administrátorský účet",
        variant: "destructive",
      });
      return;
    }

    // Delete user - this requires admin API via edge function
    toast({
      title: "Informace",
      description: "Mazání uživatelů bude implementováno v další verzi",
    });
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
        title: "Chyba",
        description: "Nepodařilo se uložit popis",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Uloženo",
      description: "Popis účtu byl aktualizován",
    });

    setEditingUser(null);
    setEditDescription("");
    loadData();
  };

  const handleChangePassword = (user: UserWithRole) => {
    setChangingPasswordUser(user);
    setNewPassword("");
  };

  const handleSavePassword = async () => {
    if (!changingPasswordUser || !newPassword) {
      toast({
        title: "Chyba",
        description: "Zadejte nové heslo",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Chyba",
        description: "Heslo musí mít alespoň 6 znaků",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Chyba",
        description: "Nejste přihlášeni",
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
      toast({
        title: "Chyba",
        description: "Nepodařilo se změnit heslo: " + error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Úspěch",
      description: "Heslo bylo změněno",
    });

    setChangingPasswordUser(null);
    setNewPassword("");
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
          <h1 className="text-3xl font-bold">Administrace</h1>
        </div>

        {/* Registration Toggle */}
        <div className="bg-card rounded-lg p-6 mb-8 border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Samoregistrace</h2>
              <p className="text-sm text-muted-foreground">
                Povolit nebo zakázat registraci nových uživatelů na přihlašovací stránce
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
            <h2 className="text-xl font-semibold">Správa uživatelů</h2>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Přidat uživatele
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Přidat nového uživatele</DialogTitle>
                  <DialogDescription>
                    Vytvořte nový uživatelský účet
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
                    <Label htmlFor="password">Heslo</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="admin"
                      checked={newUserIsAdmin}
                      onCheckedChange={setNewUserIsAdmin}
                    />
                    <Label htmlFor="admin">Administrátor</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                    Zrušit
                  </Button>
                  <Button onClick={handleAddUser}>Přidat</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Popis</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell className="max-w-xs">
                    {user.description || (
                      <span className="text-muted-foreground italic">Bez popisu</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        Uživatel
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleChangePassword(user)}
                        title="Změnit heslo"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditDescription(user)}
                        title="Upravit popis"
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
                            ? "Nemůžete smazat svůj účet" 
                            : user.email === 'admin@admin.local'
                            ? "Hlavní admin účet nelze smazat"
                            : "Smazat uživatele"
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
              <DialogTitle>Upravit popis účtu</DialogTitle>
              <DialogDescription>
                Upravte popis pro uživatele {editingUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Popis</Label>
                <Input
                  id="description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Zadejte popis účtu..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Zrušit
              </Button>
              <Button onClick={handleSaveDescription}>Uložit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={!!changingPasswordUser} onOpenChange={(open) => !open && setChangingPasswordUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Změnit heslo</DialogTitle>
              <DialogDescription>
                Změnit heslo pro uživatele {changingPasswordUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-password">Nové heslo</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Zadejte nové heslo (min. 6 znaků)"
                  minLength={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setChangingPasswordUser(null)}>
                Zrušit
              </Button>
              <Button onClick={handleSavePassword}>Změnit heslo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
