import {
  ShieldCheck,
  Database,
  Brain,
  Key,
  CreditCard,
  Archive,
  Trash2,
  Share2,
  Lock,
} from "lucide-react";
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
      "Your database credentials are encrypted at all times using a unique key per user and stored securely on our servers. These credentials are used solely for establishing authenticated database connections during query execution.",
  },
  {
    icon: CreditCard,
    title: "Payment Processing",
    description:
      "All payment processing is handled through Stripe's PCI-compliant infrastructure. We never store, process, or transmit your credit card information directly.",
  },
];

const privacyPolicySections = [
  ...securityCards,
  {
    icon: Lock,
    title: "Google User Data",
    description: (
      <>
        When you sign in with Google, we access only the necessary OAuth scopes
        to provide our service. This includes your basic profile information. We
        never sell or transfer this data to third parties, and it's used solely
        to authenticate you and provide our core services.
      </>
    ),
  },
  {
    icon: Share2,
    title: "Third-Party Sharing",
    description:
      "We do not share, transfer, or disclose your Google user data to third parties except as necessary to provide our core services. Any third-party processing is conducted under strict data protection agreements.",
  },
  {
    icon: Archive,
    title: "Data Retention",
    description:
      "We retain your Google user data only for as long as necessary to provide our services. You can request data deletion at any time through your account settings.",
  },
  {
    icon: Trash2,
    title: "Data Deletion",
    description: (
      <>
        You can request complete deletion of your data, including Google user
        data, at any time. Contact us at support@quailbi.com for data deletion
        requests. We will process your request within 30 days and confirm once
        completed.
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen text-foreground p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-4">
            Quail empowers developers with secure, privacy-focused data
            analytics
          </p>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {privacyPolicySections.map((card, index) => {
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
