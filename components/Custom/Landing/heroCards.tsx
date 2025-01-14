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

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <Card
          key={feature.title}
          className="group relative transition-all duration-300 hover:shadow-lg h-[400px] flex flex-col"
        >
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
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
      ))}
    </div>
  );
}
