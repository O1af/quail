"use client";

import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Messages } from "./Messages";
import { Input } from "./Input";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
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

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSubmit(event);
  };

  return (
    <div className="flex flex-col w-full h-[600px] border shadow-md">
      <Messages messages={messages} avatar_url={avatar_url} />
      <Input
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleFormSubmit}
      />
    </div>
  );
}
