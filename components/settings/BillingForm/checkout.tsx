"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { checkout, manageBilling } from "./stripe";
import { loadStripe } from "@stripe/stripe-js";

export default function Checkout({
  priceId,
  plan,
  current,
  end_at,
}: {
  priceId: string;
  plan: string;
  current: string;
  end_at: any;
}) {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        window.location.href = "http://app.localhost:3000/login";
      }
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("customer_id, subscription_id")
          .eq("id", user.id)
          .single();
        setCustomerId(data?.customer_id || null);
        setSubscriptionId(data?.subscription_id || null);
      }
    };
    fetchUser();
  }, [supabase]);

  const handleCheckout = async () => {
    console.log("checkout", plan, priceId, current);
    const data = JSON.parse(
      await checkout(
        user?.email,
        priceId,
        `http://localhost:3000/success?subscription=${plan}`,
      ),
    );

    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);
    const res = await stripe?.redirectToCheckout({ sessionId: data.id });
    if (res?.error) {
      console.log("failure");
      alert(`Fail to checkout, ${res.error}`);
    }
  };

  const handleBilling = async () => {
    console.log("manage billing");
    if (customerId) {
      console.log(customerId);
      const data = JSON.parse(await manageBilling(customerId));
      window.location.href = data.url;
    }
  };

  console.log(subscriptionId, "subscriptionId");
  console.log(current, "current");

  return (
    <Button
      className="w-full"
      variant={
        (current === "Free" && plan === "Free") ||
        (current === "Pro" && plan === "Pro" && subscriptionId)
          ? "secondary"
          : "default"
      }
      onClick={plan === "Free" ? handleBilling : handleCheckout}
      disabled={
        (current === "Free" && plan === "Free") ||
        (current === "Pro" && subscriptionId && plan !== "Free") ||
        (current !== "Free" && plan === "Free" && !subscriptionId)
      }
    >
      {current !== "Free" && plan === "Free" && !subscriptionId
        ? `Activates ${new Date(end_at).toDateString()}`
        : current !== "Free" && plan === current && !subscriptionId
          ? `Renew`
          : current !== "Free" && subscriptionId && plan === "Free"
            ? `Cancel ${current}`
            : current === plan && current === "Pro" && end_at
              ? `Ends ${new Date(end_at).toDateString()}`
              : current === plan
                ? "Current Plan"
                : `Get ${plan}`}
    </Button>
  );
}
