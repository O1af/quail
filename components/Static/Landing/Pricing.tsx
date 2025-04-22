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
import { cn } from "@/lib/utils";
import { APP_URL } from "@/lib/constants";
import { motion } from "framer-motion";
import { BorderBeam } from "@/components/magicui/border-beam";

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
    <section
      id="pricing"
      className="w-full py-12 md:py-16 bg-gradient-to-b from-background to-background/80"
    >
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div
          className="flex flex-col items-center justify-center space-y-3 text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl leading-tight">
            <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent inline-block">
              Simple, Transparent Pricing
            </span>
          </h2>
          <p className="max-w-[600px] text-muted-foreground text-sm md:text-base">
            Choose the perfect plan for your needs. All plans include our core
            features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card
                className={cn(
                  "flex flex-col h-full relative border shadow-sm bg-gradient-to-b from-background/95 to-background transition-all duration-300",
                  plan.name === "Pro" ? "shadow-md border-primary/30" : ""
                )}
              >
                {plan.highlight && (
                  <motion.div
                    className="absolute -top-3 left-0 right-0 flex justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.15 }}
                  >
                    <span className="bg-gradient-to-r from-primary/80 to-primary text-primary-foreground text-xs font-medium px-3 py-0.5 rounded-full shadow-md">
                      {plan.highlight}
                    </span>
                  </motion.div>
                )}

                <CardHeader
                  className={cn(
                    "flex flex-col space-y-2 pt-6 pb-3",
                    plan.highlight && "pt-8"
                  )}
                >
                  <CardTitle className="text-xl font-bold text-foreground">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    {plan.price !== null ? (
                      <>
                        <span className="text-3xl font-bold text-primary">
                          ${plan.price}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /{plan.billing}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        Custom Pricing
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow py-2">
                  <motion.ul
                    className="space-y-2"
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},
                      show: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.3 + index * 0.1,
                        },
                      },
                    }}
                  >
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={feature.name}
                        className="flex items-center text-xs"
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          show: { opacity: 1, x: 0 },
                        }}
                      >
                        <TooltipProvider>
                          {feature.included ? (
                            <Check className="h-3 w-3 text-primary mr-2 shrink-0" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground mr-2 shrink-0" />
                          )}
                          <Tooltip>
                            <TooltipTrigger className="text-left">
                              <span>{feature.name}</span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-[220px] text-xs"
                            >
                              <p>{feature.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </motion.li>
                    ))}
                  </motion.ul>
                </CardContent>

                <CardFooter className="pt-2 pb-6">
                  <Button
                    className={cn(
                      "w-full text-sm",
                      plan.name === "Pro"
                        ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
                        : "hover:bg-muted/80"
                    )}
                    variant={plan.name === "Pro" ? "default" : "outline"}
                    size="sm"
                    asChild
                  >
                    <motion.a
                      href={plan.ctaLink}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.cta}
                    </motion.a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
