"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { SidebarHeader } from "@/components/ui/sidebar";

export function DashSidebarHeader() {
  const { resolvedTheme } = useTheme();
  const avatarSrc =
    resolvedTheme === "dark" ? "/boticondark.png" : "/boticonlight.png";

  return (
    <SidebarHeader className="px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden">
          <Image
            src={avatarSrc}
            alt="Quail Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        <span className="font-medium text-sm">Quail BI</span>
      </div>
    </SidebarHeader>
  );
}
