import React, { useState, useEffect } from "react";
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
import { X, Plus, UserPlus, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dashboard } from "@/components/stores/dashboard_store";

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

  // Reset state when dialog opens or dashboard changes
  useEffect(() => {
    if (dashboard && dashboard.permissions) {
      setPermissions({
        publicView: dashboard.permissions.publicView || false,
        viewers: [...(dashboard.permissions.viewers || [])],
        editors: [...(dashboard.permissions.editors || [])],
      });
    }
  }, [dashboard, open]);

  const handleTogglePublic = () => {
    setPermissions((prev) => ({
      ...prev,
      publicView: !prev.publicView,
    }));
  };

  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes("@")) return;

    setPermissions((prev) => {
      // Avoid duplicates
      if (
        emailType === "viewer" &&
        !prev.viewers.includes(newEmail) &&
        !prev.editors.includes(newEmail)
      ) {
        return { ...prev, viewers: [...prev.viewers, newEmail] };
      } else if (
        emailType === "editor" &&
        !prev.editors.includes(newEmail) &&
        !prev.viewers.includes(newEmail)
      ) {
        return { ...prev, editors: [...prev.editors, newEmail] };
      }
      return prev;
    });

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
              <Input
                placeholder="Email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
              />
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

          {/* Editors List */}
          {permissions.editors.length > 0 && (
            <div className="space-y-2">
              <Label>Editors</Label>
              <div className="flex flex-wrap gap-2">
                {permissions.editors.map((email) => (
                  <Badge
                    key={`editor-${email}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {email}
                    <button
                      onClick={() => handleRemoveEmail(email, "editor")}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Viewers List */}
          {permissions.viewers.length > 0 && (
            <div className="space-y-2">
              <Label>Viewers</Label>
              <div className="flex flex-wrap gap-2">
                {permissions.viewers.map((email) => (
                  <Badge
                    key={`viewer-${email}`}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {email}
                    <button
                      onClick={() => handleRemoveEmail(email, "viewer")}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
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
