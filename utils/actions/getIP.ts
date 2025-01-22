"use server";
export async function getAzureIP() {
  if (!process.env.NEXT_PUBLIC_AZURE_FUNCTION_ENDPOINT) {
    throw new Error("Function endpoint not configured");
  }
  const response = await fetch(
    process.env.NEXT_PUBLIC_AZURE_FUNCTION_ENDPOINT + "/getIP",
    {
      method: "GET",
    }
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Database error: ${error}`);
  }
  const result = await response.text();
  // Extract only the IP number from the response
  return result.replace("Outbound IP: ", "");
}
