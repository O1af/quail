"use client";

import type { ChatRequestOptions, CreateMessage, Message } from "ai";
import cx from "classnames";
import type React from "react";
import {
  useRef,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
  memo,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { sanitizeUIMessages } from "@/lib/utils";
import { ArrowUpIcon, Database } from "lucide-react";
import { StopIcon } from "@/components/Dev/ChatBot/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface InputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    options?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: { preventDefault?: () => void },
    options?: ChatRequestOptions
  ) => void;
  className?: string;
}

// Memoize button components to prevent re-renders
const DatabaseButton = memo(({ onClick }: { onClick: () => void }) => (
  <Button
    className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
    onClick={onClick}
  >
    <Database size={14} />
  </Button>
));

const StopButton = memo(
  ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={onClick}
    >
      <StopIcon size={14} />
    </Button>
  )
);

const SubmitButton = memo(
  ({
    onClick,
    disabled,
  }: {
    onClick: (e: React.MouseEvent) => void;
    disabled: boolean;
  }) => (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={onClick}
      disabled={disabled}
    >
      <ArrowUpIcon size={14} />
    </Button>
  )
);

function PureInput({
  input,
  setInput,
  isLoading,
  stop,
  messages,
  setMessages,
  handleSubmit,
  className,
}: InputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const { toast } = useToast();
  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    ""
  );

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || localStorageInput || "";
      setInput(finalValue);
      adjustHeight();
    }
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
      adjustHeight();
    },
    [adjustHeight, setInput]
  );

  const submitForm = useCallback(() => {
    setLocalStorageInput("");
    if (width && width > 768) {
      textareaRef.current?.focus();
    }
    handleSubmit();
  }, [handleSubmit, setLocalStorageInput, width]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (isLoading) {
          toast({
            title: "Please wait for the model to finish its response!",
            duration: 1500,
            variant: "destructive",
          });
        } else if (input.trim().length > 0) {
          submitForm();
        }
      }
    },
    [input, isLoading, submitForm, toast]
  );

  const handleOpenSettings = useCallback(() => {
    const event = new CustomEvent("openSettings", {
      detail: { section: "database" },
    });
    window.dispatchEvent(event);
  }, []);

  const handleStop = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      stop();
      setMessages((msgs) => sanitizeUIMessages(msgs));
    },
    [setMessages, stop]
  );

  const handleSubmitClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      submitForm();
    },
    [submitForm]
  );

  return (
    <div className="relative w-full flex flex-col items-center gap-4 px-4 py-2">
      <div className="w-full max-w-3xl relative">
        <Textarea
          ref={textareaRef}
          placeholder="Send a message..."
          value={input}
          onChange={handleInput}
          className={cx(
            "max-h-[100px] min-h-[80px] overflow-y-auto resize-none rounded-2xl !text-base bg-muted pr-12 dark:border-zinc-700",
            className
          )}
          rows={3}
          autoFocus
          onKeyDown={handleKeyDown}
        />
        <div className="absolute bottom-2 right-2 space-y-1 flex flex-col items-end">
          <DatabaseButton onClick={handleOpenSettings} />
          {isLoading ? (
            <StopButton onClick={handleStop} />
          ) : (
            <SubmitButton
              onClick={handleSubmitClick}
              disabled={input.trim().length === 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export const Input = memo(PureInput, (prevProps, nextProps) => {
  // Only re-render when these crucial props change
  return (
    prevProps.input === nextProps.input &&
    prevProps.isLoading === nextProps.isLoading
  );
});
