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

const pricingPlans = [
  {
    name: "Free",
    price: 0,
    billing: "forever",
    description: "Perfect for learning and small projects",
    highlight: "Most Popular",
    features: [
      {
        name: "Basic SQL Query Execution",
        included: true,
        tooltip: "Submit and execute SQL queries through the text editor",
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
        name: "Basic Query Validation",
        included: true,
        tooltip: "Basic syntax checking without optimization",
      },
      {
        name: "Community Support",
        included: true,
        tooltip: "Access to our community forums and documentation",
      },
      {
        name: "Advanced Features",
        included: false,
        tooltip: "Upgrade to Pro for advanced features",
      },
      {
        name: "Priority Support",
        included: false,
        tooltip: "Available in Pro and Enterprise plans",
      },
    ],
    cta: "Get Started Free",
    ctaLink: "/register",
  },
  {
    name: "Pro",
    price: 20,
    billing: "monthly",
    description: "For professional developers and small teams",
    highlight: "Best Value",
    features: [
      {
        name: "Everything in Free",
        included: true,
        tooltip: "All features from the Free plan",
      },
      {
        name: "Unlimited AI-Assisted Queries",
        included: true,
        tooltip: "No monthly limit on AI-assisted queries",
      },
      {
        name: "60s Query Execution Limit",
        included: true,
        tooltip: "Extended query execution time up to 60 seconds",
      },
      {
        name: "Advanced Query Optimization",
        included: true,
        tooltip: "AI-powered query optimization suggestions",
      },
      {
        name: "Schema Analysis",
        included: true,
        tooltip: "Deep analysis of your database schema",
      },
      {
        name: "Priority Support",
        included: true,
        tooltip: "Fast response times for support queries",
      },
      {
        name: "Early Access Features",
        included: true,
        tooltip: "Beta access to new features and improvements",
      },
    ],
    cta: "Start Pro Trial",
    ctaLink: "/register?plan=pro",
  },
  {
    name: "Enterprise",
    price: null,
    billing: "custom",
    description: "Custom solutions for large teams",
    highlight: "Custom",
    features: [
      {
        name: "Everything in Pro",
        included: true,
        tooltip: "All features from the Pro plan",
      },
      {
        name: "Unlimited Query Execution",
        included: true,
        tooltip: "No limits on query execution time",
      },
      {
        name: "Custom AI Model Training",
        included: true,
        tooltip: "Train AI models on your specific database schema",
      },
      {
        name: "Role-based Access Control",
        included: true,
        tooltip: "Advanced security and user management",
      },
      {
        name: "24/7 Premium Support",
        included: true,
        tooltip: "Dedicated support team with SLA",
      },
      {
        name: "Custom Integration",
        included: true,
        tooltip: "Integration with your existing tools",
      },
      {
        name: "Dedicated Account Manager",
        included: true,
        tooltip: "Personal support for your team",
      },
    ],
    cta: "Contact Sales",
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <li className="flex items-center text-sm">
                            {feature.included ? (
                              <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                            )}
                            <span>{feature.name}</span>
                          </li>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          <p className="text-sm">{feature.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
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
