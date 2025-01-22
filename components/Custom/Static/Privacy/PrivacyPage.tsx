import { ShieldCheck, Database, Brain, Key, CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const securityCards = [
  {
    icon: ShieldCheck,
    title: "Data Privacy",
    description:
      "We prioritize data minimization, collecting only essential information to provide our services. We align with privacy-first principles, ensuring your data is handled with utmost care while maintaining optimal performance and user experience.",
  },
  {
    icon: Database,
    title: "SQL Execution",
    description:
      "Our AI operates under strict read-only protocols when executing database queries. Any data-modifying operations require explicit user authorization, ensuring complete control over your database integrity.",
  },
  {
    icon: Brain,
    title: "AI Models",
    description: (
      <>
        We leverage Azure AI's secure infrastructure, which processes requests
        without persistent data storage or retention.{" "}
        <a
          href="https://learn.microsoft.com/en-us/legal/cognitive-services/openai/data-privacy?tabs=azure-portal"
          className="underline hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read more about Azure AI data privacy
        </a>
        .
      </>
    ),
  },
  {
    icon: Key,
    title: "Database Credentials",
    description:
      "Your database credentials are securely encrypted and stored exclusively on your local device. We maintain zero credential storage on our servers, using them solely for authenticated database connections during query execution.",
  },
  {
    icon: CreditCard,
    title: "Payment Processing",
    description:
      "All payment processing is handled through Stripe's PCI-compliant infrastructure. We never store, process, or transmit your credit card information directly.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen text-foreground p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4">
            Security & Privacy
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            Quail empowers developers with secure, privacy-focused data
            analytics
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{card.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
