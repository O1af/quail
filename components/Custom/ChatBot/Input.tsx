import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { FaArrowUp } from "react-icons/fa";

interface InputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function Input({ input, handleInputChange, handleSubmit }: InputProps) {
  return (
    <div className="p-4 border-t mt-auto">
      <form
        onSubmit={handleSubmit}
        className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
      >
        <ChatInput
          placeholder="Ask Quail anything..."
          value={input}
          onChange={handleInputChange}
          className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center p-2">
          <Button
            size="sm"
            variant="secondary"
            className="ml-auto"
            type="submit"
          >
            <FaArrowUp className="text-lg" />
          </Button>
        </div>
      </form>
    </div>
  );
}
