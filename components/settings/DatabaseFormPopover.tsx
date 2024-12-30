import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatabaseConfig } from "../stores/db_store";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

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

export function DatabaseFormPopover({
  trigger,
  defaultValues,
  onSubmit,
}: Props) {
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Database
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">
                {defaultValues ? "Edit Database" : "New Database"}
              </h4>
              <p className="text-sm text-muted-foreground">
                Enter your database connection details.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  className="col-span-2 h-8"
                  {...form.register("name")}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label>Type</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(value) => form.setValue("type", value as any)}
                >
                  <SelectTrigger className="col-span-2 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgres">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="connection">Connection</Label>
                <Input
                  id="connection"
                  className="col-span-2 h-8"
                  placeholder="Enter your connection string"
                  {...form.register("connectionString")}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                {defaultValues ? "Save Changes" : "Add Database"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
