"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Checkout from "./checkout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: 0,
    billing: "forever",
    description: "Perfect for learning and small projects",
    features: [
      {
        name: "Secure Web SQL Query Execution",
        included: true,
        tooltip: "Execute SQL queries securely through our web interface",
      },
      {
        name: "100 AI-Assisted Queries/month",
        included: true,
        tooltip: "AI-assisted queries for Charts,SQL, and more",
      },
      {
        name: "10s Query Execution Limit",
        included: true,
        tooltip: "Queries are limited to 10 seconds execution time",
      },
      {
        name: "10MB Query Size Limit",
        included: true,
        tooltip: "Maximum query size of 10MB",
      },
      {
        name: "VSCode-based SQL Editor",
        included: true,
        tooltip: "Professional VSCode-based SQL editor with data display",
      },
      {
        name: "Natural Language Charts and SQL",
        included: true,
        tooltip: "Generate charts and SQL queries using natural language",
      },
    ],
    cta: "Get Started Free",
    ctaLink: `${process.env.NEXT_PUBLIC_BASE_URL}/signup`,
  },
  {
    name: "Pro",
    price: 20,
    priceId: "price_1QnBW9LTqurwLvRFgrda5plk",
    billing: "monthly",
    description: "For professionals and small teams",
    highlight: "Best Value",
    features: [
      {
        name: "Everything in Free",
        included: true,
        tooltip: "All features from the Free plan",
      },
      {
        name: "Unlimited AI-assisted Queries",
        included: true,
        tooltip: "No monthly limit on AI-assisted queries",
      },
      {
        name: "30s Query Execution Limit",
        included: true,
        tooltip: "Extended query execution time up to 30 seconds",
      },
      {
        name: "50MB Query Size Limit",
        included: true,
        tooltip: "Increased maximum query size of 50MB",
      },
      {
        name: "Early Access Features",
        included: true,
        tooltip: "Beta access to new features and improvements",
      },
      {
        name: "OpenAI GPT 4o",
        included: true,
        tooltip: "Enhanced AI assistance with OpenAI GPT 4o",
      },
    ],
  },
  {
    name: "Enterprise",
    price: null,
    billing: "custom",
    description: "Enterprise-grade solutions with dedicated support",
    highlight: "Custom",
    features: [
      {
        name: "Everything in Pro",
        included: true,
        tooltip: "All features from the Pro plan",
      },
      {
        name: "Long-running Analytical Queries",
        included: true,
        tooltip: "Support for extended analytical query processing",
      },
      {
        name: "Dynamic Query Limits",
        included: true,
        tooltip: "Flexible execution time and size limits based on needs",
      },
      {
        name: "Unlimited AI-assisted Queries",
        included: true,
        tooltip: "No restrictions on AI-assisted query usage",
      },
      {
        name: "Team Management Tools",
        included: true,
        tooltip: "Advanced team and access management features",
      },
      {
        name: "Dedicated Support",
        included: true,
        tooltip: "Priority support with dedicated team",
      },
    ],
    cta: "Contact Us",
    ctaLink: "/contact",
  },
];

export function BillingForm() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string>("Free");
  const [end_at, setEnd_at] = useState<Date | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("Free");

  useEffect(() => {
    if (!loading) setSelectedPlan(tier);
  }, [loading, tier]);

  useEffect(() => {
    const fetchUserAndTier = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("tier, end_at")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching tier:", error);
        } else {
          setTier(data?.tier || "Free");
          setEnd_at(data?.end_at || null);
        }
      }
      setLoading(false);
    };

    fetchUserAndTier();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  const activePlan = plans.find((p) => p.name === selectedPlan)!;

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Choose Your Plan</h2>
        <p className="text-gray-500 text-sm">
          Select the best plan for your needs
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={selectedPlan}
        onValueChange={setSelectedPlan}
        className="mt-4"
      >
        <TabsList className="mx-auto w-fit">
          {plans.map((plan) => (
            <TabsTrigger
              key={plan.name}
              value={plan.name}
              className="px-3 py-1 text-sm"
            >
              {plan.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Animated Card */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={selectedPlan}
          layout
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mt-6"
        >
          <Card className="p-4 rounded-lg shadow h-[380px]">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg font-semibold">
                    {activePlan.name}
                  </CardTitle>
                  {activePlan.highlight && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                      {activePlan.highlight}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {activePlan.price !== null ? (
                    <>
                      <p className="text-2xl font-bold">${activePlan.price}</p>
                      <p className="text-xs text-gray-500">
                        {activePlan.billing === "monthly"
                          ? "/mo"
                          : activePlan.billing === "forever"
                          ? "Forever"
                          : "Custom"}
                      </p>
                    </>
                  ) : (
                    <p className="text-lg font-semibold">Custom</p>
                  )}
                </div>
              </div>
              <CardDescription className="text-sm">
                {activePlan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 overflow-auto">
              <ul className="space-y-1 text-sm">
                {activePlan.features.map((feature) => (
                  <li key={feature.name} className="flex items-center">
                    {feature.included ? (
                      <Check className="mr-2 text-green-500 w-4 h-4" />
                    ) : (
                      <X className="mr-2 text-gray-400 w-4 h-4" />
                    )}
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              {selectedPlan === "Pro" ? (
                <Checkout
                  priceId={activePlan.priceId!}
                  plan={activePlan.name}
                  current={tier}
                  end_at={end_at}
                />
              ) : (
                <Button
                  asChild
                  className="w-full text-sm font-medium py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  disabled={selectedPlan === tier}
                >
                  <a href={activePlan.ctaLink}>
                    {selectedPlan === tier ? "Current Plan" : activePlan.cta}
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
