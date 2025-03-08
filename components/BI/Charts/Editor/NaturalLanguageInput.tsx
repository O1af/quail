import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRightCircle, Sparkles, Loader2 } from "lucide-react";

interface NaturalLanguageInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isProcessing: boolean;
  onSubmit: () => Promise<void>;
}

export default function NaturalLanguageInput({
  prompt,
  setPrompt,
  isProcessing,
  onSubmit,
}: NaturalLanguageInputProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey && prompt.trim() && !isProcessing) {
        e.preventDefault();
        onSubmit();
      }
    },
    [prompt, isProcessing, onSubmit]
  );

  const canSubmit = prompt.trim() && !isProcessing;

  return (
    <div className="relative py-1 px-2">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        <Sparkles className="h-4 w-4" />
      </div>

      <Input
        type="text"
        placeholder="Describe chart changes in natural language..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isProcessing}
        className="pl-10 pr-10 rounded-full border-0 shadow-none bg-transparent"
      />

      <div
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer ${
          canSubmit ? "text-primary" : "text-muted-foreground opacity-50"
        }`}
        onClick={() => canSubmit && onSubmit()}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ArrowRightCircle className="h-5 w-5" />
        )}
      </div>
    </div>
  );
}
