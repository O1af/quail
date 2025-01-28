import Stripe from "stripe";
import { headers } from "next/headers";
import { buffer } from "node:stream/consumers";
import { supabaseAdmin } from "@/utils/supabase/admin";

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

const stripe = new Stripe(process.env.STRIPE_SK!);

export async function POST(req: any) {
  const rawBody = await buffer(req.body);
  const headersList = await headers();
  try {
    console.log("rawBody", rawBody);
    let event;
    try {
      const sig = headersList.get("stripe-signature");

      event = stripe.webhooks.constructEvent(rawBody, sig!, endpointSecret!);
    } catch (err: any) {
      return Response.json({ error: `Webhook Error ${err?.message}` });
    }
    switch (event.type) {
      case "invoice.payment_succeeded":
        // handle subscription deleted event
        const result = event.data.object;
        const supabase = await supabaseAdmin();
        const end_at = new Date(
          result.lines.data[0].period.end * 1000,
        ).toISOString();
        const customer_id = result.customer as string;
        const subscription_id = result.subscription as string;
        const email = result.customer_email as string;
        const planID = result.lines.data[0].plan?.id;
        const tier =
          planID === "price_1QlG73PolF2uvnj4fHWOCwGo" ? "Pro" : "Free";

        const { error } = await supabase
          .from("profiles")
          .update({
            tier,
            end_at,
            customer_id,
            subscription_id,
          })
          .eq("email", email);
        if (error) {
          console.log(error);
          return Response.json({ error: error.message });
        }

        break;
      case "customer.subscription.updated":
        const updateSubscription = event.data.object;
        const udpateSupabase = await supabaseAdmin();
        const { error: updateError } = await udpateSupabase
          .from("profiles")
          .update({
            subscription_id: null,
          })
          .eq("subscription_id", updateSubscription.id);

        if (updateError) {
          console.log(updateError);
          return Response.json({ error: updateError.message });
        }

        break;
      case "customer.subscription.deleted":
        const deleteSubscription = event.data.object;
        console.log("HELP I DELETE", deleteSubscription.customer);
        const delSupabase = await supabaseAdmin();
        const { error: delError } = await delSupabase
          .from("profiles")
          .update({
            tier: "Free",
            customer_id: null,
            subscription_id: null,
          })
          .eq("customer_id", deleteSubscription.customer);

        if (delError) {
          console.log(delError);
          return Response.json({ error: delError.message });
        }

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return Response.json({});
  } catch (e) {
    return Response.json({ error: `Webhook Error}` });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
