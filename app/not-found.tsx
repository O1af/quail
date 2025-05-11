"use client";

import Link from "next/link";
import Image from "next/image";
import Routes from "@/components/routes";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Header } from "@/components/Static/Landing/header";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { Meteors } from "@/components/magicui/meteors";
import { motion } from "framer-motion";

export default function NotFound() {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <Header />
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-16 relative overflow-hidden">
        <Meteors
          number={3}
          minDelay={1.5}
          maxDelay={4.0}
          minDuration={9.0}
          maxDuration={12.0}
        />

        <Container className="relative z-10 pt-14">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto flex justify-center mb-6">
              <Image
                src="/quail_logo.svg"
                alt="Quail Logo"
                width={70}
                height={70}
                className={`${
                  resolvedTheme === "dark" ? "brightness-0 invert" : ""
                }`}
              />
            </div>

            <motion.h1
              className="mt-4 text-7xl font-bold tracking-tight bg-gradient-to-r from-red-400 via-rose-500 to-red-500 bg-clip-text text-transparent sm:text-8xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              404
            </motion.h1>

            <motion.p
              className="mt-6 text-xl text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Could not find requested resource
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                <Link href={Routes.Home} prefetch={false}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return Home
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border bg-background/50 hover:bg-muted/50 backdrop-blur-sm"
              >
                <Link href="/contact" prefetch={false}>
                  Contact Support
                </Link>
              </Button>
            </motion.div>
          </div>
        </Container>
      </div>
    </>
  );
}
