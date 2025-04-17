"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function DashSidebarHeader() {
  const { resolvedTheme } = useTheme();
  const avatarSrc =
    resolvedTheme === "dark" ? "/boticondark.png" : "/boticonlight.png";
  const { open } = useSidebar();
  const router = useRouter();

  return (
    <SidebarHeader className="px-3 py-2.5 border-b">
      <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
        <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden">
          <Image
            src={avatarSrc}
            alt="Quail Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        {open && (
          <span className="font-semibold text-sm tracking-tight">Quail AI</span>
        )}
      </Link>
    </SidebarHeader>
  );
}
