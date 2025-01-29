"use client";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/header/mode-toggle";

export function Header() {
  const { resolvedTheme } = useTheme();
  const avatarSrc =
    resolvedTheme === "dark" ? "/boticondark.png" : "/boticonlight.png";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={avatarSrc}
              alt="Quail Logo"
              width={24}
              height={24}
              className="size-8"
            />
            <span className="font-semibold">Quail</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <ModeToggle />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </Container>
    </header>
  );
}
