"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/ui/chat/chat-input"; // Importing ChatInput from shadcn-chat-cli
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAction,
} from "@/components/ui/chat/chat-bubble";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FaArrowUp } from "react-icons/fa";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    handleSubmit(event); // Submit the message
  };

  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);

  const avatar_url = user?.user_metadata?.avatar_url ?? "";

  const actionIcons = [
    { icon: "Copy", type: "Copy" },
    { icon: "RefreshCcw", type: "Regenerate" },
  ];

  return (
    <div className="flex flex-col w-full h-[825] border shadow-md">
      {/* Scrollable Area for Chat Messages */}
      <div className="flex-grow px-4 py-2 overflow-y-auto">
        <ChatMessageList>
          {messages.map((m) => {
            const variant = m.role === "user" ? "sent" : "received";
            return (
              <ChatBubble key={m.id} variant={variant} layout="ai">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={
                      m.role === "user" ? avatar_url : "/path/to/ai-avatar.png"
                    }
                    alt={m.role === "user" ? "User Avatar" : "AI Avatar"}
                  />
                  <AvatarFallback>
                    {m.role === "user" ? "CN" : "AI"}
                  </AvatarFallback>
                </Avatar>

                <ChatBubbleMessage
                  className="text-white text-right"
                  variant={variant}
                >
                  {m.content}

                  {/* Display actions if message is from AI */}
                  {m.role === "ai" && (
                    <div className="mt-2 flex space-x-2">
                      {actionIcons.map(({ icon, type }) => (
                        <ChatBubbleAction
                          key={type}
                          icon={<span>{icon}</span>} // Replace with actual icons if necessary
                          onClick={() =>
                            console.log(
                              `Action ${type} clicked for message ${m.id}`,
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </ChatBubbleMessage>
              </ChatBubble>
            );
          })}
        </ChatMessageList>
      </div>

      {/* Input Area with ChatInput */}
      <div className="p-4 border-t">
        <form
          onSubmit={handleFormSubmit}
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
    </div>
  );
}
