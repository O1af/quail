export async function getTier(
  supabase: any,
  userId: string,
  columnName: string
) {
  const [profileResponse, reqCountResponse] = await Promise.all([
    supabase.from("profiles").select("tier").eq("id", userId).single(),
    supabase.from("req_count").select(columnName).eq("id", userId).single(),
  ]);

  if (profileResponse.error) {
    throw new Error(
      `Failed to get user tier: ${profileResponse.error.message}`
    );
  }

  const tier = profileResponse.data?.tier;
  const count = reqCountResponse.data?.[columnName] || 0;

  // Check tier limits
  if (tier === "Free") {
    const freeLimit = parseInt(process.env.FREE_TIER_MONTHLY_LIMIT || "100");
    if (count >= freeLimit) {
      throw new Error(
        "Free tier monthly limit reached. Please upgrade your plan to continue."
      );
    }
  } else if (tier === "Pro") {
    const proLimit = 10000;
    if (count >= proLimit) {
      throw new Error(
        "Pro tier monthly limit reached. Please contact support if you need a higher limit."
      );
    }
  }

  return { tier, count };
}

export async function updateTokenUsage(
  supabase: any,
  userId: string,
  columnName: string,
  tokenCount: number
) {
  const { error } = await supabase.rpc("increment_token_count", {
    p_user_id: userId,
    p_column_name: columnName,
    p_increment_value: tokenCount,
  });

  if (error) throw new Error(`Failed to update token usage: ${error.message}`);
}

export async function updateUsage(
  supabase: any,
  userId: string,
  columnName: string
) {
  const { error } = await supabase.rpc("increment_req_count", {
    p_user_id: userId,
    p_column_name: columnName,
  });

  if (error) throw new Error(`Failed to update AI usage: ${error.message}`);
}

export function getCurrentUsageColumn(): string {
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" }).toLowerCase();
  const year = now.getFullYear();
  return `${month}_${year}`;
}
