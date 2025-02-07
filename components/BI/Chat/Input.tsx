import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SendIcon } from "lucide-react";
import { FormEvent } from "react";

interface InputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
}

export function Input({
  input,
  handleInputChange,
  handleSubmit,
  className,
}: InputProps) {
  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex items-end gap-2", className)}
    >
      <Textarea
        value={input}
        onChange={handleInputChange}
        placeholder="Type a message..."
        className="min-h-[60px] resize-none"
      />
      <Button type="submit" size="icon">
        <SendIcon className="h-4 w-4" />
      </Button>
    </form>
  );
}
