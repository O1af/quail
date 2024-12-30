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
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { DatabaseConfig } from "../stores/db_store";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["postgres", "mysql", "sqlite"]),
  connectionString: z.string().min(1, "Connection string is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  trigger?: React.ReactNode;
  defaultValues?: Partial<DatabaseConfig>;
  onSubmit: (data: FormValues) => void;
}

export function DatabaseDialog({ trigger, defaultValues, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      type: "postgres",
      connectionString: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    setOpen(false);
    form.reset();
  };

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
                <SelectItem value="sqlite">SQLite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="connection">Connection</Label>
            <Input
              id="connection"
              placeholder="Enter your connection string"
              {...form.register("connectionString")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {defaultValues ? "Save Changes" : "Add Database"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
