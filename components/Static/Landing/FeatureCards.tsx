import { motion } from "framer-motion";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ChatCard } from "./ChatCard";
import { DBCard } from "./DBCard";
import { ChartCard } from "./ChartCard";
import { Bot, BarChartBig, Database, Sparkles } from "lucide-react";
import { MagicCard } from "@/components/magicui/magic-card";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface Feature {
  title: string;
  description: string;
  component?: React.FC;
  icon: React.ElementType;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
}

const features: Feature[] = [
  {
    title: "AI Data Query Editor",
    description:
      "Create and optimize SQL queries effortlessly with our intelligent, schema-aware assistant",
    component: ChatCard,
    icon: Bot,
    iconColor: "text-blue-500",
    gradientFrom: "#3b82f6",
    gradientTo: "#06b6d4",
  },
  {
    title: "Natural Language Data Analysis",
    description:
      "Ask questions about your data in plain English and get visualized insights instantly",
    component: ChartCard,
    icon: BarChartBig,
    iconColor: "text-emerald-500",
    gradientFrom: "#10b981",
    gradientTo: "#22c55e",
  },
  {
    title: "Simple and Secure Integration",
    description:
      "Link your databases in seconds with our secure, zero-configuration setup process",
    component: DBCard,
    icon: Database,
    iconColor: "text-violet-500",
    gradientFrom: "#8b5cf6",
    gradientTo: "#a855f7",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function FeatureCards() {
  const { resolvedTheme } = useTheme();
  return (
    <section id="features" className="py-12 md:py-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -z-10" />

      <Container>
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-muted/60 text-muted-foreground text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Powerful Features</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6 leading-tight">
            <span className="bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent inline-block pb-1">
              Everything You Need to Work With Data
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform how you interact with your data using our advanced
            AI-powered tools designed for everyone on your team
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <MagicCard
                className="flex flex-col overflow-hidden rounded-xl h-full border-[1.5px] border-border/40"
                gradientFrom={feature.gradientFrom}
                gradientTo={feature.gradientTo}
                gradientColor={
                  resolvedTheme === "dark" ? "#262626" : "#D9D9D955"
                }
                gradientSize={180}
              >
                <CardHeader className="relative z-10">
                  <div
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg ${feature.iconColor} bg-linear-to-br from-muted/80 to-muted group-hover:from-muted/60 group-hover:to-background transition-colors duration-300`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/80">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0 grow flex flex-col relative z-10">
                  {feature.component && <feature.component />}
                </CardContent>
              </MagicCard>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
