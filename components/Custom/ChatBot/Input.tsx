import { Button } from "@/components/ui/button";
import { SendHorizontal, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface InputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  stop: () => void;
}

export function Input({
  input,
  handleInputChange,
  handleSubmit,
  handleKeyDown,
  isLoading,
  stop,
}: InputProps) {
  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex items-center w-full mx-auto px-4 py-4 space-x-2"
      >
        <div className="relative flex-1">
          <Textarea
            onKeyDown={handleKeyDown}
            value={input}
            onChange={handleInputChange}
            placeholder="Send a message..."
          />
        </div>
        {isLoading ? (
          <Button type="button" size="icon" onClick={stop}>
            <div className="relative">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </Button>
        ) : (
          <Button type="submit" size="icon" disabled={!input}>
            <SendHorizontal className="h-4 w-4" />
          </Button>
        )}
        <span className="sr-only">Send message</span>
      </form>
    </div>
  );
}
