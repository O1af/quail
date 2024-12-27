"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/ui/chat/chat-input"; // Importing ChatInput from shadcn-chat-cli
import { ChatMessageList } from "./ui/chat/chat-message-list";
import { ChatBubble } from "./ui/chat/chat-bubble";
import { ChatBubbleMessage } from "./ui/chat/chat-bubble";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

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

  return (
    <div className="flex flex-col w-full h-[825] border shadow-md">
      {/* Header */}
      <div className="p-3 text-center font-semibold text-lg">
        Chat with Quail
      </div>

      {/* Scrollable Area for Chat Messages */}
      <div className="flex-grow px-4 py-2 overflow-y-auto">
        <ChatMessageList>
          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              variant={m.role === "user" ? "sent" : "received"} // Determine message variant based on the sender
            >
              <Avatar>
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
                variant={m.role === "user" ? "sent" : "received"}
              >
                {m.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
        </ChatMessageList>
      </div>

      {/* Input Area with ChatInput */}
      <div className="p-4 border-t">
        <form
          onSubmit={handleFormSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
        >
          <ChatInput
            placeholder="Type your message here..."
            value={input}
            onChange={handleInputChange}
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          />

          <div className="flex items-center p-3 pt-0">
            <Button size="sm" className="ml-auto gap-1.5" type="submit">
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
