import { ObjectId } from "mongodb";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const id = new ObjectId().toString();
  return new Response(JSON.stringify({ id }));
}
