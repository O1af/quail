"use client";
import React from "react";
import Chat from "@/components/BI/Chat/Chat";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const chat_id = searchParams.get("chat_id");

  return <Chat className="h-full" chat_id={chat_id || undefined} />; // Changed from id to chat_id
}
