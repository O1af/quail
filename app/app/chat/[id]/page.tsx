"use client";
import React from "react";
import Chat from "@/components/BI/Chat/Chat";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ id: string }>();
  return <Chat className="h-[calc(100vh-12rem)]" id={params.id} />;
}
