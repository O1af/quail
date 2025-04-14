"use client";
import React, { useEffect } from "react";
import Chat from "@/components/BI/Chat/Chat";
import { useParams } from "next/navigation";
import { useHeader } from "@/components/header/header-context";
import { SpeedModeToggle } from "@/components/header/speed-mode-toggle";

export default function Page() {
  const params = useParams<{ chat_id: string }>();
  const { setHeaderButtons } = useHeader();

  // Set speed mode toggle in the header
  useEffect(() => {
    setHeaderButtons(
      <div className="flex items-center space-x-2">
        <SpeedModeToggle />
      </div>
    );

    // Clean up when unmounting
    return () => {
      setHeaderButtons(null);
    };
  }, [setHeaderButtons]);

  return <Chat className="h-full" chat_id={params.chat_id} />;
}
