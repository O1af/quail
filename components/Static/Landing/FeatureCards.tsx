import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatCard } from "./ChatCard";
import { DBCard } from "./DBCard";
import { ChartCard } from "./ChartCard";

interface Feature {
  title: string;
  description: string;
  link: string;
  action: string;
  component?: React.FC;
}

const features: Feature[] = [
  {
    title: "AI Data Query Editor",
    description:
      "Create and optimize SQL queries effortlessly with our intelligent, schema-aware assistant",
    link: "/demo/natural-language",
    action: "Try Demo",
    component: ChatCard,
  },
  {
    title: "Natural Language Data Analysis",
    description: "Ask questions about your data in plain English",
    link: "/features/analysis",
    action: "Learn More",
    component: ChartCard,
  },
  {
    title: "Simple and Secure Integration",
    description: "Link your Data in seconds with our simple setup",
    link: "/docs/integration",
    action: "View Docs",
    component: DBCard,
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
    <motion.div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {features.map((feature) => (
        <motion.div
          key={feature.title}
          variants={cardVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="group relative transition-all duration-300 hover:shadow-lg h-[400px] flex flex-col bg-gradient-to-b from-background to-background/80 hover:from-background hover:to-emerald-50/5 border-muted/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                {feature.title}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              {feature.component ? <feature.component /> : <></>}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
