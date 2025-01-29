export async function getTier(
  supabase: any,
  userId: string,
  columnName: string
) {
  const [profileResponse, miniCountResponse, fullCountResponse] =
    await Promise.all([
      supabase.from("profiles").select("tier").eq("id", userId).single(),
      supabase.from("mini_count").select(columnName).eq("id", userId).single(),
      supabase.from("full_count").select(columnName).eq("id", userId).single(),
    ]);

  if (profileResponse.error) {
    throw new Error(
      `Failed to get user tier: ${profileResponse.error.message}`
    );
  }

  const tier = profileResponse.data?.tier;

  // Select count based on tier
  let count;
  if (tier === "Pro") {
    //if (fullCountResponse.error) {
    //  throw new Error(
    //    `Failed to get usage count: ${fullCountResponse.error.message}`
    //  );
    //}
    count = fullCountResponse.data?.[columnName] || 0;
  } else {
    //if (miniCountResponse.error) {
    //  throw new Error(
    //    `Failed to get usage count: ${miniCountResponse.error.message}`,
    //  );
    //}
    count = miniCountResponse.data?.[columnName] || 0;
  }

  //// console.log(`User tier: ${tier}, usage count: ${count}`);

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
  tokenCount: number,
  tier: string
) {
  const rpcName =
    tier === "Pro" ? "increment_full_tokens" : "increment_mini_tokens";
  const { error } = await supabase.rpc(rpcName, {
    p_user_id: userId,
    p_column_name: columnName,
    p_increment_value: tokenCount,
  });
  if (error) throw new Error(`Failed to update token usage: ${error.message}`);
}

export async function updateUsage(
  supabase: any,
  userId: string,
  columnName: string,
  tier: string
) {
  const rpcName =
    tier === "Pro" ? "increment_full_count" : "increment_mini_count";
  const { error } = await supabase.rpc(rpcName, {
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

export function getModelName(tier: string): string {
  return tier === "Pro" ? "gpt-4o" : "gpt-4o-mini";
}
