import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Demo() {
  const { resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<string>("light");

  // Update theme after mount to prevent hydration mismatch
  useEffect(() => {
    setCurrentTheme(resolvedTheme || "light");
  }, [resolvedTheme]);

  // Choose thumbnail based on theme
  const thumbnailSrc =
    currentTheme === "dark"
      ? "/landing/dash-dark.png"
      : "/landing/dash-light.png";

  return (
    <section
      id="demo"
      className="py-12 md:py-16 bg-linear-to-b from-background to-background/90 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      <Container>
        <motion.div
          className="flex flex-col items-center text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-3">
            Watch Quail in Action
          </span>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-3 leading-tight">
            <span className="bg-linear-to-r from-primary/90 to-primary bg-clip-text text-transparent inline-block pb-1">
              See Quail Transform Your Workflow
            </span>
          </h2>
        </motion.div>

        <motion.div
          className="relative max-w-[80%] md:max-w-[70%] mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <HeroVideoDialog
            animationStyle="top-in-bottom-out"
            videoSrc="https://www.youtube.com/embed/Ic3Ql7ZX9Ds?si=8qwc8NxI0_g-rJeZ&controls=0&autoplay=1"
            thumbnailSrc={thumbnailSrc}
            thumbnailAlt={`Quail Demo Video (${currentTheme} mode)`}
            className="w-full rounded-xl overflow-hidden shadow-2xl border border-white/10"
          />
        </motion.div>
      </Container>
    </section>
  );
}
