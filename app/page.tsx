"use client";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";

export default function Home() {
  const theme = useTheme();
  const avatarSrc =
    theme.resolvedTheme === "dark" ? "/BotIconDark.Png" : "/BotIconLight.Png";
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src={avatarSrc}
                alt="Buster Logo"
                width={24}
                height={24}
                className="size-8"
              />
              <span className="font-semibold">Quail</span>
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="#" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Pricing
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button
                    onClick={() =>
                      (window.location.href = "http://app.localhost:3000/login")
                    }
                  >
                    Get Started
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24">
          <Container className="space-y-12 text-center">
            <div className="mx-auto max-w-[800px] space-y-6">
              <Badge variant="secondary" className="mx-auto">
                🚀 AI-Powered Business Insights
              </Badge>
              <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                <span className="bg-gradient-to-r from-green-600 to-green-300 bg-clip-text text-transparent">
                  AI-Driven{" "}
                </span>{" "}
                <br />
                Insights, Simplified
              </h1>
              <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
                With Quail, anyone can write SQL queries, analyze data, and
                generate insights effortlessly. It’s intelligent, efficient, and
                AI-powered.
              </p>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
