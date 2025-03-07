"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getAzureIP } from "@/utils/actions/getIP";
import { testConnection } from "@/components/stores/utils/query";
import { DatabaseConfig } from "@/components/stores/db_store";

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
import { Loader2, X, AlertCircle, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DB_TYPES = {
  postgres: {
    name: "PostgreSQL",
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
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const dbType = form.watch("type"); // Get current DB type
  const dbTypeInfo = DB_TYPES[dbType];

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
        form.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setTesting(false);
      }
    },
    [onSubmit, form]
  );

  return (
    <Card className="mb-6 border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {isEditing ? "Edit Connection" : "Add New Connection"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Connection Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="My Database"
                autoFocus
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Database Type</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(value: "postgres" | "mysql") =>
                  form.setValue("type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="connection">Connection String</Label>
            <Input
              id="connection"
              placeholder={dbTypeInfo.formatExample}
              {...form.register("connectionString")}
              className="font-mono text-sm"
            />
            {form.formState.errors.connectionString && (
              <p className="text-sm text-destructive">
                {form.formState.errors.connectionString.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Example: {dbTypeInfo.formatExample}
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
                Choose how to handle SSL for this connection
              </p>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {ip && (
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
              <ShieldCheck className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-400">
                Make sure to add this IP to your database allow list:{" "}
                <code className="bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded text-xs">
                  {ip}
                </code>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={testing}>
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing connection...
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
