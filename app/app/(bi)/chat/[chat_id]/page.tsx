"use client";
import React from "react";
import Chat from "@/components/BI/Chat/Chat";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ chat_id: string }>();
  return <Chat className="h-full" chat_id={params.chat_id} />; // Changed from id to chat_id
}
