"use client";
import React from "react";
import Chat from "@/components/BI/Chat/Chat";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return <Chat className="h-full" id={id || undefined} />;
}
