import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ChatCard } from "./ChatCard";
import { DBCard } from "./DBCard";
import { ChartCard } from "./ChartCard";
import { ArrowRight, Bot, BarChartBig, Database, Sparkles } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  component?: React.FC;
  icon: React.ElementType;
  color: string;
  gradientClass: string;
  iconColor: string;
  borderColor: string;
}

const features: Feature[] = [
  {
    title: "AI Data Query Editor",
    description:
      "Create and optimize SQL queries effortlessly with our intelligent, schema-aware assistant",
    component: ChatCard,
    icon: Bot,
    color: "from-blue-500/20 to-cyan-400/10",
    gradientClass: "from-blue-500/5 via-cyan-500/5 to-blue-500/5",
    iconColor: "text-blue-500",
    borderColor: "group-hover:border-blue-400/30",
  },
  {
    title: "Natural Language Data Analysis",
    description:
      "Ask questions about your data in plain English and get visualized insights instantly",
    component: ChartCard,
    icon: BarChartBig,
    color: "from-emerald-500/20 to-green-400/10",
    gradientClass: "from-emerald-500/5 via-green-500/5 to-emerald-500/5",
    iconColor: "text-emerald-500",
    borderColor: "group-hover:border-emerald-400/30",
  },
  {
    title: "Simple and Secure Integration",
    description:
      "Link your databases in seconds with our secure, zero-configuration setup process",
    component: DBCard,
    icon: Database,
    color: "from-violet-500/20 to-purple-400/10",
    gradientClass: "from-violet-500/5 via-purple-500/5 to-violet-500/5",
    iconColor: "text-violet-500",
    borderColor: "group-hover:border-violet-400/30",
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
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent inline-block pb-1">
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
              <Card
                className={`group relative overflow-hidden transition-all duration-500 h-[500px] flex flex-col border border-muted hover:border-opacity-100 ${feature.borderColor} shadow-lg hover:shadow-xl`}
              >
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradientClass} opacity-30 group-hover:opacity-50 transition-opacity duration-700`}
                />

                <CardHeader className="relative z-10">
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-lg ${feature.iconColor} bg-gradient-to-br from-muted/80 to-muted group-hover:from-muted/60 group-hover:to-background transition-colors duration-300 shadow-sm`}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-4 flex-grow flex flex-col relative z-10">
                  {feature.component && <feature.component />}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
