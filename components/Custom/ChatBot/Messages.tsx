import { Message } from "ai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAction,
} from "@/components/ui/chat/chat-bubble";

interface MessagesProps {
  messages: Message[];
  avatar_url: string;
}

const actionIcons = [
  { icon: "Copy", type: "Copy" },
  { icon: "RefreshCcw", type: "Regenerate" },
];

export function Messages({ messages, avatar_url }: MessagesProps) {
  return (
    <div className="flex-grow px-4 py-2 overflow-y-auto h-[calc(100%-100px)]">
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
                {m.role === "assistant" && (
                  <div className="mt-2 flex space-x-2">
                    {actionIcons.map(({ icon, type }) => (
                      <ChatBubbleAction
                        key={type}
                        icon={<span>{icon}</span>}
                        onClick={() =>
                          console.log(
                            `Action ${type} clicked for message ${m.id}`
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
  );
}
