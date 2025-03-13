import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Search, Edit, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dashboard } from "@/components/stores/dashboard_store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboard: Dashboard;
  onUpdatePermissions: (permissions: Dashboard["permissions"]) => Promise<void>;
}

export function ShareDialog({
  open,
  onOpenChange,
  dashboard,
  onUpdatePermissions,
}: ShareDialogProps) {
  // Local state for the current permissions being edited
  const [permissions, setPermissions] = useState<Dashboard["permissions"]>({
    publicView: false,
    viewers: [],
    editors: [],
  });

  // Email input states
  const [newEmail, setNewEmail] = useState("");
  const [emailType, setEmailType] = useState<"viewer" | "editor">("viewer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add error state for email input
  const [emailError, setEmailError] = useState<string | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Reset state when dialog opens or dashboard changes
  useEffect(() => {
    if (dashboard && dashboard.permissions) {
      setPermissions({
        publicView: dashboard.permissions.publicView || false,
        viewers: [...(dashboard.permissions.viewers || [])],
        editors: [...(dashboard.permissions.editors || [])],
      });
    }
    setEmailError(null);
  }, [dashboard, open]);

  const handleTogglePublic = () => {
    setPermissions((prev) => ({
      ...prev,
      publicView: !prev.publicView,
    }));
  };

  const handleAddEmail = () => {
    // Clear previous errors
    setEmailError(null);

    // Basic validation
    if (!newEmail) {
      setEmailError("Please enter an email address");
      return;
    }

    if (!newEmail.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Check if email already exists in either list
    if (permissions.editors.includes(newEmail)) {
      setEmailError(`${newEmail} already has editor access`);
      return;
    }

    if (permissions.viewers.includes(newEmail)) {
      setEmailError(`${newEmail} already has viewer access`);
      return;
    }

    // Add to the appropriate list if not a duplicate
    setPermissions((prev) => {
      if (emailType === "viewer") {
        return { ...prev, viewers: [...prev.viewers, newEmail] };
      } else {
        return { ...prev, editors: [...prev.editors, newEmail] };
      }
    });

    // Clear input on successful add
    setNewEmail("");
  };

  const handleRemoveEmail = (email: string, type: "viewer" | "editor") => {
    setPermissions((prev) => {
      if (type === "viewer") {
        return { ...prev, viewers: prev.viewers.filter((e) => e !== email) };
      } else {
        return { ...prev, editors: prev.editors.filter((e) => e !== email) };
      }
    });
  };

  const handleChangePermissionLevel = (
    email: string,
    newType: "viewer" | "editor"
  ) => {
    setPermissions((prev) => {
      // Create new arrays excluding the email
      const newViewers = prev.viewers.filter((e) => e !== email);
      const newEditors = prev.editors.filter((e) => e !== email);

      // Add email to the appropriate array based on new type
      if (newType === "viewer") {
        newViewers.push(email);
      } else {
        newEditors.push(email);
      }

      return {
        ...prev,
        viewers: newViewers,
        editors: newEditors,
      };
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onUpdatePermissions(permissions);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update permissions:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine all users for display
  const allUsers = useMemo(() => {
    const users: { email: string; role: "editor" | "viewer" }[] = [];

    permissions.editors.forEach((email) => {
      users.push({ email, role: "editor" });
    });

    permissions.viewers.forEach((email) => {
      users.push({ email, role: "viewer" });
    });

    // Sort alphabetically by email
    return users.sort((a, b) => a.email.localeCompare(b.email));
  }, [permissions.editors, permissions.viewers]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;

    return allUsers.filter((user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Dashboard</DialogTitle>
          <DialogDescription>
            Share this dashboard with others or make it publicly viewable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Public Access Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Access</Label>
              <div className="text-sm text-muted-foreground">
                Anyone with the link can view this dashboard
              </div>
            </div>
            <Switch
              checked={permissions.publicView}
              onCheckedChange={handleTogglePublic}
            />
          </div>

          {/* Add Email Form */}
          <div className="space-y-2">
            <Label>Add People</Label>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <div className="relative">
                  <Input
                    placeholder="Email address"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      // Clear error when user starts typing again
                      if (emailError) setEmailError(null);
                    }}
                    className={emailError ? "border-destructive" : ""}
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-destructive">{emailError}</p>
                )}
              </div>
              <select
                value={emailType}
                onChange={(e) =>
                  setEmailType(e.target.value as "viewer" | "editor")
                }
                className="bg-background border border-input rounded-md px-3 py-2 text-sm"
              >
                <option value="viewer">Can view</option>
                <option value="editor">Can edit</option>
              </select>
              <Button variant="secondary" onClick={handleAddEmail}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Combined User List with Search */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>People with access</Label>
              {allUsers.length > 0 && (
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Search emails"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9 w-[200px]"
                  />
                </div>
              )}
            </div>

            {allUsers.length > 0 ? (
              <div className="border rounded-md divide-y">
                {filteredUsers.map(({ email, role }) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-2 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      {role === "editor" ? (
                        <Edit className="h-4 w-4 text-primary" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{email}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8">
                          {role === "editor" ? "Editor" : "Viewer"}{" "}
                          <span className="ml-1">▼</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className={role === "editor" ? "bg-muted" : ""}
                          onClick={() =>
                            handleChangePermissionLevel(email, "editor")
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editor</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={role === "viewer" ? "bg-muted" : ""}
                          onClick={() =>
                            handleChangePermissionLevel(email, "viewer")
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Viewer</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemoveEmail(email, role)}
                          className="text-destructive focus:text-destructive border-t"
                        >
                          <X className="mr-2 h-4 w-4" />
                          <span>Remove access</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-3 text-center border rounded-md">
                No users have been added yet
              </div>
            )}

            {allUsers.length > 0 && filteredUsers.length === 0 && (
              <div className="text-sm text-muted-foreground py-3 text-center border rounded-md">
                No users match your search
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
