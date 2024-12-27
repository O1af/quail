"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Import Shadcn Textarea
import { useState } from "react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [localInput, setLocalInput] = useState(input);

  const handleLocalInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setLocalInput(event.target.value);
    handleInputChange(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && event.shiftKey) {
      setLocalInput(localInput + "\n");
      event.preventDefault();
    } else if (event.key === "Enter") {
      handleSubmit(event);
      setLocalInput("");
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSubmit(event);
    setLocalInput("");
  };

  return (
    <div className="flex flex-col w-full  border shadow-md">
      {/* Header */}
      <div className="p-3 text-center font-semibold text-lg">
        Chat with Quail
      </div>

      {/* Scrollable Area for Chat Messages */}
      <div className="flex-grow px-4 py-2 h-[600] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`whitespace-pre-wrap ${
                m.role === "user"
                  ? "text-right text-blue-500 pr-1"
                  : "text-left text-gray-700 pl-1"
              }`}
            >
              <span className="font-medium">
                {m.role === "user" ? "User:" : "AI:"}
              </span>{" "}
              {m.content}
            </div>
          ))}
        </div>
      </div>

      {/* Input Area with Textarea */}
      <div className="p-4 border-t">
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center space-x-2 w-full"
        >
          <Textarea
            className="w-full resize-none"
            value={localInput}
            placeholder="Say something..."
            onChange={handleLocalInputChange}
            onKeyDown={handleKeyDown} // Handle key press for multiline
            rows={4} // Set the height of the Textarea to 4 lines
          />
          <Button type="submit" variant="outline" className="px-4">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
