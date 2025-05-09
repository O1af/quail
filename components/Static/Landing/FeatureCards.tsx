import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { DBCard } from "./DBCard";
import { ChartCard } from "./ChartCard";
import { APP_URL } from "@/lib/constants";
import {
  Bot,
  BarChartBig,
  Database,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTheme } from "next-themes";

// Image Card component for displaying background images
const ImageCard = ({ imagePath, alt }: { imagePath: string; alt: string }) => {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-md shadow-sm">
      <div className="h-full w-full relative">
        <Image
          src={imagePath}
          alt={alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
};

// Theme-aware image component that switches based on dark/light mode
const ThemeAwareImage = ({
  lightSrc,
  darkSrc,
  alt,
}: {
  lightSrc: string;
  darkSrc: string;
  alt: string;
}) => {
  const { resolvedTheme } = useTheme();
  const imagePath = resolvedTheme === "dark" ? darkSrc : lightSrc;

  return <ImageCard imagePath={imagePath} alt={alt} />;
};

const features = [
  {
    name: "AI SQL Query Editor",
    description: "", // Empty description
    contentComponent: () => (
      <ThemeAwareImage
        lightSrc="/landing/editor-light.png"
        darkSrc="/landing/editor-dark.png"
        alt="AI SQL Query Editor preview"
      />
    ),
    Icon: Bot,
    href: `${APP_URL}/signup`,
    cta: "Explore",
    className: "md:col-span-1",
    gradientFrom: "#3b82f6", // blue-500
    gradientTo: "#06b6d4", // cyan-500
  },
  {
    name: "Data Visualization",
    description: "", // Empty description
    contentComponent: ChartCard,
    Icon: BarChartBig,
    href: `${APP_URL}/signup`,
    cta: "Visualize",
    className: "md:col-span-1",
    gradientFrom: "#10b981", // emerald-500
    gradientTo: "#22c55e", // green-500
  },
  {
    name: "Secure DB Integration",
    description: "", // Empty description
    contentComponent: DBCard,
    Icon: Database,
    href: `${APP_URL}/signup`,
    cta: "Connect",
    className: "md:col-span-1",
    gradientFrom: "#8b5cf6", // violet-500
    gradientTo: "#a855f7", // purple-500
  },
  {
    name: "Interactive Dashboards",
    description: "", // Empty description
    contentComponent: () => (
      <ThemeAwareImage
        lightSrc="/landing/dash-light.png"
        darkSrc="/landing/dash-dark.png"
        alt="Interactive Dashboards preview"
      />
    ),
    Icon: LayoutDashboard,
    href: `${APP_URL}/signup`,
    cta: "Discover",
    className: "md:col-span-1",
    gradientFrom: "#f59e0b", // amber-500
    gradientTo: "#f97316", // orange-500
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="py-10 md:py-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -z-10" />

      <Container>
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-muted/60 text-muted-foreground text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Powerful Features</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 leading-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent inline-block pb-1">
              Everything You Need for Data
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform how you interact with your data using our AI-powered tools
          </p>
        </motion.div>

        <BentoGrid className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {features.map((feature, idx) => (
            <BentoCard
              key={idx}
              name={feature.name}
              description={feature.description}
              Icon={feature.Icon}
              href={feature.href}
              cta={feature.cta}
              className={cn("flex flex-col", feature.className)}
              gradientFrom={feature.gradientFrom}
              gradientTo={feature.gradientTo}
              background={
                <div className="w-full h-full">
                  {feature.contentComponent && <feature.contentComponent />}
                </div>
              }
            />
          ))}
        </BentoGrid>
      </Container>
    </section>
  );
}
