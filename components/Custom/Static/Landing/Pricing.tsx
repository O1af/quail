"use client";

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
import { APP_URL } from "@/lib/constants";

const pricingPlans = [
  {
    name: "Free",
    price: 0,
    billing: "forever",
    description: "Perfect for learning and small projects",
    highlight: "Most Popular",
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
        name: "OpenAI GPT 4o Mini",
        included: true,
        tooltip: "AI assistance powered by OpenAI GPT 4o Mini",
      },
    ],
    cta: "Get Started Free",
    ctaLink: `${APP_URL}/signup`,
  },
  {
    name: "Pro",
    price: 20,
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
    cta: "Sign Up for Pro",
    ctaLink: `${APP_URL}/signup`,
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

export function Pricing() {
  return (
    <section className="w-full min-h-screen flex items-center justify-center py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Choose the perfect plan for your needs. All plans include our core
            features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 md:mt-12 lg:mt-16">
          {pricingPlans.map((plan) => (
            <Card key={plan.name} className="flex flex-col h-full relative">
              {plan.highlight && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    {plan.highlight}
                  </span>
                </div>
              )}

              <CardHeader className="flex flex-col space-y-2 pb-6">
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  {plan.price !== null ? (
                    <>
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-sm text-muted-foreground">
                        /{plan.billing}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">Custom Pricing</span>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <TooltipProvider key={feature.name}>
                      <li className="flex items-center text-sm">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                        )}
                        <Tooltip>
                          <TooltipTrigger>
                            <span>{feature.name}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="text-sm">{feature.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    </TooltipProvider>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  className="w-full"
                  variant={plan.name === "Pro" ? "default" : "outline"}
                  size="lg"
                  asChild
                >
                  <a href={plan.ctaLink}>{plan.cta}</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
