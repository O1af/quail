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
import { APP_URL } from "@/lib/constants";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const { resolvedTheme } = useTheme();
  const avatarSrc =
    resolvedTheme === "dark" ? "/boticondark.png" : "/boticonlight.png";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track scrolling to apply background blur only when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-50">
            <Image
              src={avatarSrc}
              alt="Quail Logo"
              width={24}
              height={24}
              className="size-7 transition-transform hover:scale-110"
            />
            <span className="font-semibold text-lg">Quail</span>
          </Link>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              className={`bg-primary transition-colors`}
              onClick={() => window.open(`${APP_URL}/signup`, "_blank")}
            >
              Sign Up
            </Button>
            <ModeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <ModeToggle />
          </div>
        </div>
      </Container>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur z-40">
          <Container className="py-6">
            <nav className="flex flex-col gap-4">
              <div className="pt-4">
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.open(`${APP_URL}/signup`, "_blank")}
                >
                  Sign Up
                </Button>
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
