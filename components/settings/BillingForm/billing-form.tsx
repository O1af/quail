"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const plans = [
  {
    name: "Free",
    price: 0,
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
        tooltip: "AI-assisted queries powered by GPT 4o Mini",
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
        name: "VSCode-based Editor",
        included: true,
        tooltip: "Professional VSCode-based SQL editor with data display",
      },
      {
        name: "OpenAI 4o Mini",
        included: true,
        tooltip: "AI assistance powered by OpenAI 4o Mini",
      },
    ],
  },
  {
    name: "Pro",
    price: 20,
    description: "For professional developers and small teams",
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
        name: "OpenAI 4o",
        included: true,
        tooltip: "Enhanced AI assistance with OpenAI 4o",
      },
    ],
  },
  {
    name: "Enterprise",
    price: null,
    description: "Custom solutions for large teams",
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
  },
];

export function BillingForm() {
  const [selectedPlan, setSelectedPlan] = useState("Free");

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Choose Your Plan</h2>
        <p className="text-muted-foreground text-sm">
          Select the perfect plan for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col h-full ${
              selectedPlan === plan.name
                ? "border-primary bg-primary/5 shadow-md"
                : "hover:border-primary/50 hover:shadow-sm"
            }`}
          >
            <CardHeader className="pb-4 pt-6 px-4">
              <div className="flex items-baseline justify-between mb-2">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  {plan.price !== null ? (
                    <>
                      <span className="text-2xl font-bold">${plan.price}</span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                    </>
                  ) : (
                    <span className="text-sm font-medium">Custom</span>
                  )}
                </div>
              </div>
              <CardDescription className="text-xs">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow px-4 pb-4">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <TooltipProvider key={feature.name}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <li
                          className={`flex items-center text-sm ${
                            !feature.included && "text-muted-foreground"
                          }`}
                        >
                          {feature.included ? (
                            <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                          )}
                          <span>{feature.name}</span>
                        </li>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="max-w-[200px] text-center"
                      >
                        <p className="text-sm">{feature.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="px-4 pb-6 mt-auto">
              <Button
                className="w-full"
                variant={plan.name === "Free" ? "secondary" : "default"}
                onClick={() => setSelectedPlan(plan.name)}
                disabled={plan.name === "Free" && selectedPlan === "Free"}
              >
                {selectedPlan === plan.name
                  ? "Current Plan"
                  : plan.name === "Enterprise"
                  ? "Contact Us"
                  : plan.name === "Pro"
                  ? "Upgrade to Pro"
                  : "Start with Free"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
