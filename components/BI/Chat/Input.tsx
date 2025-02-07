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
  disabled?: boolean;
}

export function Input({
  input,
  handleInputChange,
  handleSubmit,
  className,
  disabled,
}: InputProps) {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <form onSubmit={onSubmit} className={cn("flex items-end gap-2", className)}>
      <Textarea
        value={input}
        onChange={handleInputChange}
        placeholder="Type a message..."
        className="min-h-[60px] resize-none"
        disabled={disabled}
      />
      <Button type="submit" size="icon" disabled={disabled || !input.trim()}>
        <SendIcon className="h-4 w-4" />
      </Button>
    </form>
  );
}
