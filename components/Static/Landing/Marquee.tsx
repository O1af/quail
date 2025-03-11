"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import FastMarquee from "react-fast-marquee";

interface MarqueeProps {
  className?: string;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  speed?: number;
  companies?: string[];
}

const defaultCompanies = [
  "netflix",
  "microsoft",
  //  "palantir",
  "capitalOne",
  "github",
  "datadog",
];

export function Marquee({
  className,
  direction = "left",
  speed = 14, // Faster default speed (was 20)
  companies = defaultCompanies,
}: MarqueeProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Convert our speed to react-fast-marquee's speed (higher = faster in their lib)
  const marqueeSpeed = 100 - speed * 5; // Adjust scale: lower is faster in our implementation, higher is faster in react-fast-marquee

  return (
    <section className="py-8 md:py-12 relative overflow-hidden">
      <Container className="text-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl bg-gradient-to-r from-foreground/90 to-foreground/70 bg-clip-text text-transparent inline-block pb-1">
            Loved by Engineers at Leading Companies
          </h2>
        </motion.div>
      </Container>

      <div className={cn("relative w-full overflow-hidden", className)}>
        <div className="max-w-4xl mx-auto">
          {" "}
          {!prefersReducedMotion ? (
            <FastMarquee
              speed={marqueeSpeed}
              direction={direction}
              gradient={true}
              gradientColor="var(--background)"
              gradientWidth={100}
              className="py-2"
            >
              {companies.map((company, i) => (
                <div
                  key={`${company}-${i}`}
                  className="mx-6 flex items-center justify-center h-16"
                >
                  <Image
                    src={`/logos/${company}.svg`}
                    alt={`${company} logo`}
                    width={100}
                    height={40}
                    className="h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-all filter-auto grayscale-[50%] hover:grayscale-0"
                    priority={i < 6} // Prioritize loading the first few logos
                  />
                </div>
              ))}
            </FastMarquee>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-8 px-4">
              {companies.map((company, i) => (
                <div
                  key={`${company}-${i}`}
                  className="mx-3 mb-3 flex items-center justify-center h-16"
                >
                  <Image
                    src={`/logos/${company}.svg`}
                    alt={`${company} logo`}
                    width={100}
                    height={40}
                    className="h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-all filter-auto grayscale-[50%] hover:grayscale-0"
                    priority={i < 6}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
