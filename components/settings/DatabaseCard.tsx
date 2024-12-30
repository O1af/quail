import { DatabaseConfig } from "../stores/db_store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["postgres", "mysql", "sqlite"]),
  connectionString: z.string().min(1, "Connection string is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface DatabaseCardProps {
  db: DatabaseConfig;
  onEdit: (id: number, data: FormValues) => void;
  onDelete: (id: number) => void;
}

export function DatabaseCard({ db, onEdit, onDelete }: DatabaseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: db.name,
      type: db.type,
      connectionString: db.connectionString,
    },
  });

  const handleSubmit = (values: FormValues) => {
    onEdit(db.id, values);
    setIsEditing(false);
  };

  return (
    <Card className="flex items-center justify-between p-3">
      <span className="font-medium">{db.name}</span>
      <div className="flex gap-2">
        <Popover open={isEditing} onOpenChange={setIsEditing}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Pencil className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Edit Database</h4>
                  <p className="text-sm text-muted-foreground">
                    Modify your database connection details.
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
                      onValueChange={(value) =>
                        form.setValue("type", value as any)
                      }
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
                      {...form.register("connectionString")}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(db.id)}
          className="text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
