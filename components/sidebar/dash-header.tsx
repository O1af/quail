"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function DashSidebarHeader() {
  const { resolvedTheme } = useTheme();
  const { open } = useSidebar();
  const router = useRouter();

  return (
    <SidebarHeader className="px-3 py-1.5 border-b">
      {" "}
      {/* Reduced py-2.5 to py-1.5 */}
      <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden">
          {" "}
          {/* Reduced h-12 w-12 to h-8 w-8 */}
          <Image
            src="/quail_logo.svg"
            alt="Quail Logo"
            fill
            className={`object-cover ${
              resolvedTheme === "dark" ? "brightness-0 invert" : ""
            }`}
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
