import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

export default function Messages({ messages }: { messages: any[] }) {
  return (
    <div className="flex flex-col w-full px-2 space-y-6">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex space-x-2 p-2 rounded-lg ${
            m.role === "user"
              ? "bg-white flex text-black self-end justify-end max-w-[75%]" // User messages aligned to the right
              : "bg-transparent flex text-white self-start justify-start max-w-[75%]" // Bot messages aligned to the left
          }`}
        >
          {m.role !== "user" && (
            <div className="flex-shrink-0">
              <Avatar className="w-6 h-6">
                <AvatarImage src="/BotIcon.png" alt="QuailAI" />
              </Avatar>
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm">{m.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
