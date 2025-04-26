"use client";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ModeToggle } from "@/components/header/buttons/mode-toggle";
import { APP_URL } from "@/lib/constants";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ScrollProgress } from "@/components/magicui/scroll-progress";

// Navigation links configuration
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/docs", label: "Docs" },
];

export function Header() {
  const { resolvedTheme } = useTheme();
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
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-center py-3">
      <Container
        className={`max-w-3xl rounded-full px-6 transition-all duration-300 ${
          isScrolled
            ? "bg-background/75 backdrop-blur-md border border-border/40 shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-50">
            <Image
              src="/quail_logo.svg"
              alt="Quail Logo"
              width={42}
              height={42}
              className={`size-15 transition-transform hover:scale-110 ${
                resolvedTheme === "dark" ? "brightness-0 invert" : ""
              }`}
            />
            <span className="font-semibold text-lg">Quail</span>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
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
          <div className="flex md:hidden items-center gap-2">
            <ModeToggle />
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
          </div>
        </div>
      </Container>
      {/* Scroll Progress positioned to match the container */}
      <div className="absolute top-[65px] w-full flex justify-center">
        <ScrollProgress
          className={`max-w-3xl rounded-full transition-all duration-300 ${
            isScrolled ? "opacity-100" : "opacity-75"
          }`}
        />
      </div>
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-background/95 backdrop-blur-sm z-40">
          <Container className="py-6">
            <nav className="flex flex-col gap-4">
              {/* Mobile Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-foreground hover:text-muted-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)} // Close menu on click
                >
                  {link.label}
                </Link>
              ))}
              {/* Separator */}
              <hr className="my-2 border-border/40" />
              {/* Sign Up Button */}
              <div className="pt-2">
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
