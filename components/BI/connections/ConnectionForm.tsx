"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getAzureIP } from "@/utils/actions/getIP";
import { testConnection } from "@/components/stores/utils/query";
import { DatabaseConfig } from "@/lib/types/stores/dbConnections";
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
import { Loader2, X, ShieldCheck, Database, ServerCrash } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SiPostgresql, SiMysql } from "react-icons/si";
import { cn } from "@/lib/utils";

const DB_TYPES = {
  postgres: {
    name: "PostgreSQL",
    icon: <SiPostgresql className="h-5 w-5 text-[#336791]" />,
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
    icon: <SiMysql className="h-5 w-5 text-[#00758F]" />,
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

interface ConnectionFormProps {
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  defaultValues?: Partial<DatabaseConfig>;
  isEditing?: boolean;
}

export function ConnectionForm({
  onSubmit,
  onCancel,
  defaultValues,
  isEditing = false,
}: ConnectionFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [hasSSLInString, setHasSSLInString] = useState(false);
  const [ip, setIp] = useState<string>("");

  useEffect(() => {
    getAzureIP()
      .then(setIp)
      .catch(() => {});
  }, []);

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

  const dbType = form.watch("type");
  const dbTypeInfo = DB_TYPES[dbType];

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
      } catch (err) {
        setConnectionError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsSaving(false);
      }
    },
    [onSubmit, form]
  );

  return (
    <Card className="mb-5 border shadow-sm">
      <CardHeader className="py-4 px-5">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            {isEditing ? "Edit Connection" : "New Connection"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md -mr-2"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent className="space-y-5 px-5">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Connection Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="My Database"
                  autoFocus
                  className={cn(
                    form.formState.errors.name && "border-destructive"
                  )}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
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
                        className="flex-1 gap-2"
                        onClick={() => form.setValue("type", type)}
                      >
                        {DB_TYPES[type].icon}
                        {DB_TYPES[type].name}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="connection">Connection String</Label>
              <Input
                id="connection"
                placeholder={dbTypeInfo.formatExample}
                {...form.register("connectionString")}
                className={cn(
                  "font-mono text-sm",
                  form.formState.errors.connectionString && "border-destructive"
                )}
              />
              {form.formState.errors.connectionString && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.connectionString.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Format: {dbTypeInfo.formatExample}
              </p>
            </div>

            {!hasSSLInString && (
              <div className="space-y-2">
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
                <p className="text-xs text-muted-foreground">
                  Choose the SSL connection security level
                </p>
              </div>
            )}

            {connectionError && (
              <Alert variant="destructive" className="mt-2">
                <ServerCrash className="h-4 w-4 mr-2" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>{connectionError}</AlertDescription>
              </Alert>
            )}

            {ip && (
              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
                <ShieldCheck className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-400 text-xs">
                  Add this IP to your database allowlist:&nbsp;
                  <code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">
                    {ip}
                  </code>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t pt-4 px-5 gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            size="sm"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {isEditing ? "Saving..." : "Adding..."}
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Add Connection"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
