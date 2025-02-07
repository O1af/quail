"use client";
import React from "react";
import Chat from "@/components/BI/Chat/Chat";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  return <Chat className="h-[calc(100vh-12rem)]" id={id || undefined} />;
}
