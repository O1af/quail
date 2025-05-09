"use client";

import { Container } from "@/components/ui/container";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Marquee as MagicUIMarquee } from "@/components/magicui/marquee";

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
  speed = 14,
  companies = defaultCompanies,
}: MarqueeProps) {
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
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl bg-linear-to-r from-foreground/90 to-foreground/70 bg-clip-text text-transparent inline-block pb-1">
            Loved by Engineers at Leading Companies
          </h2>
        </motion.div>
      </Container>

      <div className={cn("relative w-full overflow-hidden", className)}>
        <div className="max-w-4xl mx-auto">
          <MagicUIMarquee
            pauseOnHover={true}
            reverse={direction === "right"}
            className="py-2"
            style={{ "--duration": `${speed}s` } as React.CSSProperties}
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
                  priority={i < 6}
                />
              </div>
            ))}
          </MagicUIMarquee>
        </div>
      </div>
    </section>
  );
}
