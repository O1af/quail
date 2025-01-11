"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useCallback, memo } from "react";
import { DatabaseConfig } from "../stores/db_store";
import { testConnection } from "../stores/utils/query";

const SSL_MODES = {
  postgres: [
    "disable", // No SSL
    "allow", // Try non-SSL first, then SSL
    "prefer", // Try SSL first, then non-SSL
    "require", // Always use SSL
    "verify-ca", // Verify server certificate
    "verify-full", // Verify server certificate and hostname
  ],
  mysql: [
    "true", // Enable SSL
    "false", // Disable SSL
    "preferred", // Use SSL if available
    "required", // Require SSL
    "verify_ca", // Verify server certificate
    "verify_identity", // Verify server certificate and hostname
  ],
  sqlite: [], // SQLite doesn't use SSL
} as const;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["postgres", "mysql", "sqlite"]),
  connectionString: z.string().min(1, "Connection string is required"),
  sslMode: z.string().optional(),
});

const CONNECTION_FORMATS = {
  postgres: "postgresql://[username]:[password]@[host]:[port]/[database]",
  mysql: "mysql://[username]:[password]@[host]:[port]/[database]",
  sqlite: "[path_to_database]",
} as const;

function parseConnectionString(connString: string) {
  try {
    const url = new URL(connString);
    const params = Object.fromEntries(url.searchParams);
    return {
      base: `${url.protocol}//${url.username}:${url.password}@${url.host}${url.pathname}`,
      sslMode: params.sslmode || params.ssl || params["ssl-mode"],
      params,
    };
  } catch {
    // For non-URL formats (like SQLite)
    return {
      base: connString,
      sslMode: undefined,
      params: {},
    };
  }
}

function buildConnectionString(
  base: string,
  sslMode: string | undefined,
  type: string
) {
  if (type === "sqlite") return base;

  try {
    const url = new URL(base);
    if (sslMode) {
      if (type === "postgres") {
        url.searchParams.set("sslmode", sslMode);
      } else if (type === "mysql") {
        // MySQL uses both 'ssl' and 'ssl-mode' parameters
        url.searchParams.set("ssl", sslMode);
        if (["verify_ca", "verify_identity"].includes(sslMode)) {
          url.searchParams.set("ssl-mode", sslMode);
        }
      }
    }
    return url.toString();
  } catch {
    return base;
  }
}

type FormValues = z.infer<typeof formSchema>;

interface Props {
  trigger?: React.ReactNode;
  defaultValues?: Partial<DatabaseConfig>;
  onSubmit: (data: FormValues) => void;
}

export const DatabaseDialog = memo(function DatabaseDialog({
  trigger,
  defaultValues,
  onSubmit,
}: Props) {
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSSLInString, setHasSSLInString] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      type: "postgres",
      connectionString: "",
      sslMode: "require",
    },
  });

  // Add effect to check for SSL in connection string
  useEffect(() => {
    const connString = form.watch("connectionString");
    if (!connString) {
      setHasSSLInString(false);
      return;
    }

    try {
      const { sslMode } = parseConnectionString(connString);
      setHasSSLInString(!!sslMode);
    } catch {
      setHasSSLInString(false);
    }
  }, [form.watch("connectionString")]);

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      try {
        setTesting(true);
        setError(null);

        const { base, sslMode: existingSSL } = parseConnectionString(
          values.connectionString
        );
        const finalSslMode = values.sslMode || existingSSL || "require";
        const finalConnString = buildConnectionString(
          base,
          finalSslMode,
          values.type
        );

        await testConnection(finalConnString, values.type);
        onSubmit({ ...values, connectionString: finalConnString });
        setOpen(false);
        form.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setTesting(false);
      }
    },
    [onSubmit]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Database
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Database" : "New Database"}
          </DialogTitle>
          <DialogDescription>
            Enter your database connection details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) => form.setValue("type", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgres">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                {/* <SelectItem value="sqlite">SQLite</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="connection">Connection string</Label>
            <Input
              id="connection"
              placeholder={CONNECTION_FORMATS[form.watch("type")]}
              {...form.register("connectionString")}
            />
          </div>
          {form.watch("type") !== "sqlite" && !hasSSLInString && (
            <div className="grid gap-2">
              <Label>SSL Mode</Label>
              <Select
                value={form.watch("sslMode")}
                onValueChange={(value) => form.setValue("sslMode", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SSL_MODES[form.watch("type")].map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing connection...
                </>
              ) : defaultValues ? (
                "Save Changes"
              ) : (
                "Add Database"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
