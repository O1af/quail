"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useCallback, memo } from "react";
import { DatabaseConfig } from "@/lib/hooks/use-database";
import { testConnection } from "@/lib/hooks/query-helpers";
import { getAzureIP } from "@/utils/actions/getIP";
import { SiPostgresql, SiMysql } from "react-icons/si";

const DB_TYPES = {
  postgres: {
    name: "PostgreSQL",
    icon: <SiPostgresql className="h-4 w-4 text-[#336791]" />,
    formatExample:
      "postgresql://[username]:[password]@[host]:[port]/[database]",
    sslModes: [
      "disable",
      "allow",
      "prefer",
      "require",
      "verify-ca",
      "verify-full",
    ],
  },
  mysql: {
    name: "MySQL",
    icon: <SiMysql className="h-4 w-4 text-[#00758F]" />,
    formatExample: "mysql://[username]:[password]@[host]:[port]/[database]",
    sslModes: [
      "true",
      "false",
      "preferred",
      "required",
      "verify_ca",
      "verify_identity",
    ],
  },
} as const;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["postgres", "mysql"]),
  connectionString: z.string().min(1, "Connection string is required"),
  sslMode: z.string().optional(),
});

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

interface DatabaseDialogProps {
  trigger?: React.ReactNode;
  defaultValues?: Partial<DatabaseConfig>;
  onSubmit: (data: FormValues) => void;
  children?: React.ReactNode; // Add children prop to fix TypeScript error
}

export const DatabaseDialog = memo(function DatabaseDialog({
  trigger,
  defaultValues,
  onSubmit,
  children,
}: DatabaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [hasSSLInString, setHasSSLInString] = useState(false);
  const [ip, setIp] = useState<string>("");

  useEffect(() => {
    if (open) {
      getAzureIP()
        .then(setIp)
        .catch(() => {});
    }
  }, [open]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      type: "postgres",
      connectionString: "",
      sslMode: "require",
    },
  });

  // Reset error when form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (connectionError) setConnectionError(null);
    });
    return () => subscription.unsubscribe();
  }, [form, connectionError]);

  // Check for SSL in connection string
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
        setIsSaving(true);
        setConnectionError(null);

        const { base, sslMode: existingSSL } = parseConnectionString(
          values.connectionString
        );
        const finalSslMode = values.sslMode || existingSSL || "require";
        const finalConnString = buildConnectionString(
          base,
          finalSslMode,
          values.type
        );

        // Still test connection before submitting
        await testConnection(finalConnString, values.type);
        onSubmit({ ...values, connectionString: finalConnString });
        form.reset();
        setOpen(false);
      } catch (err) {
        setConnectionError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsSaving(false);
      }
    },
    [onSubmit, form]
  );

  const dbType = form.watch("type");
  const dbTypeInfo = DB_TYPES[dbType];

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          // Reset form state when dialog closes
          setConnectionError(null);
          setIsSaving(false);
        }
      }}
    >
      <DialogTrigger asChild>
        {children || trigger || <Button size="sm">Add Database</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Database" : "New Database"}
          </DialogTitle>
          <DialogDescription>
            Enter your database connection details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="My Database"
                autoFocus
              />
              {form.formState.errors.name && (
                <span className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </span>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label>Database Type</Label>
              <div className="flex gap-2">
                {(Object.keys(DB_TYPES) as Array<keyof typeof DB_TYPES>).map(
                  (type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={
                        form.watch("type") === type ? "default" : "outline"
                      }
                      className="flex-1 gap-1.5 text-sm"
                      onClick={() => form.setValue("type", type)}
                    >
                      {DB_TYPES[type].icon}
                      {DB_TYPES[type].name}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="connection">Connection String</Label>
              <Input
                id="connection"
                placeholder={dbTypeInfo.formatExample}
                {...form.register("connectionString")}
                className="font-mono text-xs"
              />
              {form.formState.errors.connectionString && (
                <span className="text-xs text-destructive">
                  {form.formState.errors.connectionString.message}
                </span>
              )}
              <p className="text-xs text-muted-foreground">
                Format: {dbTypeInfo.formatExample}
              </p>
            </div>

            {!hasSSLInString && (
              <div className="grid gap-1.5">
                <Label>SSL Mode</Label>
                <Select
                  value={form.watch("sslMode")}
                  onValueChange={(value) => form.setValue("sslMode", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dbTypeInfo.sslModes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {connectionError && (
              <Alert variant="destructive" className="py-2 text-xs">
                <AlertDescription>{connectionError}</AlertDescription>
              </Alert>
            )}

            {ip && (
              <Alert className="py-2 text-xs bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                  <AlertDescription className="text-amber-800 dark:text-amber-400">
                    Add IP to your database allowlist:&nbsp;
                    <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">
                      {ip}
                    </code>
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>

          <DialogFooter className="sm:justify-end">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    {defaultValues ? "Saving..." : "Adding..."}
                  </>
                ) : defaultValues ? (
                  "Save Changes"
                ) : (
                  "Add Database"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
