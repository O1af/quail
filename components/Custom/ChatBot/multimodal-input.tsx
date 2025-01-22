"use client";

import type { ChatRequestOptions, CreateMessage, Message } from "ai";
import cx from "classnames";
import type React from "react";
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  memo,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage, useWindowSize } from "usehooks-ts";

import { sanitizeUIMessages } from "@/lib/utils";

import { ArrowUpIcon, StopIcon } from "./icons";
import { ChartNoAxesCombined } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDatabaseStructure } from "@/components/stores/table_store";
import { generateChartConfig } from "@/app/app/api/chat/actions";
import { Config } from "@/lib/types";
import { Results } from "./Results";
import { Result } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function PureMultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const { toast } = useToast();

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    "",
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    setLocalStorageInput("");

    if (width && width > 768) {
      textareaRef.current?.focus();
    }

    handleSubmit();
  }, [handleSubmit, setLocalStorageInput, width]);

  //const databaseStructure = useDatabaseStructure();
  //const [chartConfig, setChartConfig] = useState<Config | null>(null);
  //const [columns, setColumns] = useState<string[]>([]);
  //const [results, setResults] = useState<Result[]>([]);

  console.log(messages);

  //const handleChartConfigGeneration = async () => {
  //  setChartConfig(null);
  //  console.log("Handle Chart Generation New Function Called");
  //  setLocalStorageInput("");
  //  if (width && width > 768) {
  //    textareaRef.current?.focus();
  //  }
  //  setInput("");
  //  console.log("input: ", input);
  //  //console.log("Generating chart config for query:", userQuery);
  //  try {
  //    console.log(databaseStructure);
  //    console.log("Current DB:", databaseStructure);
  //
  //    const response = await generateChartConfig(databaseStructure, input);
  //
  //    const responseColumns =
  //      response.results.length > 0 ? Object.keys(response.results[0]) : [];
  //
  //    setColumns(responseColumns);
  //
  //    setChartConfig(response.config);
  //    setResults(response.results);
  //    console.log("Generated Chart Config:", chartConfig);
  //    console.log(results);
  //  } catch (error) {
  //    console.error("Error generating chart config:", error);
  //  }
  //};

  return (
    <div className="relative w-full flex flex-col gap-4">
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        tabIndex={-1}
      />

      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cx(
          "max-h-[calc(7.5vh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700",
          className,
        )}
        rows={2}
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

      <div className="absolute bottom-0 right-0 p-2 space-x-1 w-fit flex flex-row justify-end">
        {isLoading ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton
            input={input}
            submitForm={submitForm}
            uploadQueue={uploadQueue}
          />
        )}
        {/*<Dialog>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleChartConfigGeneration()}
              disabled={input.length === 0 || uploadQueue.length > 0}
              className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
            >
              <ChartNoAxesCombined />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[75dvw] max-h-[82dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            {chartConfig ? (
              <Results
                results={results}
                chartConfig={chartConfig}
                columns={columns}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
          </DialogContent>
        </Dialog>*/}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => sanitizeUIMessages(messages));
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
