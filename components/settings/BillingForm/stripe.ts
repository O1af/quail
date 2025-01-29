"use server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SK!);

export async function checkout(
  email: string,
  priceId: string,
  redirectTo: string
) {
  return JSON.stringify(
    await stripe.checkout.sessions.create({
      success_url: redirectTo || "http://localhost:3000/success",
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
    })
  );
}

export async function manageBilling(customer_id: string) {
  return JSON.stringify(
    await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    })
  );
}

export async function renewSubscription(subscriptionId: string) {
  return JSON.stringify(
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
  );
}
