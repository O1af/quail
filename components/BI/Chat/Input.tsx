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

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

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

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submitForm = useCallback(() => {
    setLocalStorageInput("");
    if (width && width > 768) {
      textareaRef.current?.focus();
    }
    handleSubmit();
  }, [handleSubmit, setLocalStorageInput, width]);

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
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (isLoading) {
                toast({
                  title: "Please wait for the model to finish its response!",
                  duration: 1500,
                  variant: "destructive",
                });
              } else {
                submitForm();
              }
            }
          }}
        />
        <div className="absolute bottom-2 right-2 space-y-1 flex flex-col items-end">
          <Button
            className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
            onClick={() => {
              const event = new CustomEvent("openSettings", {
                detail: { section: "database" },
              });
              window.dispatchEvent(event);
            }}
          >
            <Database size={14} />
          </Button>
          {isLoading ? (
            <Button
              className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
              onClick={(e) => {
                e.preventDefault();
                stop();
                setMessages((msgs) => sanitizeUIMessages(msgs));
              }}
            >
              <StopIcon size={14} />
            </Button>
          ) : (
            <Button
              className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
              onClick={(e) => {
                e.preventDefault();
                submitForm();
              }}
              disabled={input.length === 0}
            >
              <ArrowUpIcon size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export const Input = memo(PureInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  return true;
});
