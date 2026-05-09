export interface ZacxTemplateMessage {
  to: string;
  templateName: string;
  channelId: string;
  variables: string[];
}

export async function sendZacxTemplateMessage({
  to,
  templateName,
  channelId,
  variables,
}: ZacxTemplateMessage) {
  const apiKey = process.env.ZACX_API_KEY;
  
  if (!apiKey) {
    console.error("ZACX_API_KEY is not set");
    return { success: false, error: "API Key missing" };
  }

  // Clean phone number: remove '+' and spaces
  const cleanPhone = to.replace(/\D/g, "");

  try {
    console.log("Sending Zacx Message to:", cleanPhone, "with Template:", templateName);
    
    const response = await fetch("https://api.rumwork.io/api/messages/send", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel_id: channelId,
        phone_number: cleanPhone,
        template: {
          name: templateName,
          language: {
            policy: "deterministic",
            code: "en", 
          },
          components: [
            {
              type: "body",
              parameters: variables.map((v) => ({
                type: "text",
                text: v,
              })),
            },
          ],
        },
      }),
    });

    const result = await response.json();
    console.log("Zacx API Response Status:", response.status);
    console.log("Zacx API Result:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error("Zacx API Error:", result);
      return { success: false, error: result.message || "Failed to send message" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Zacx Fetch Error:", error);
    return { success: false, error: "Network error" };
  }
}
