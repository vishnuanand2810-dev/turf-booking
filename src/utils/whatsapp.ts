export async function sendWhatsAppConfirmation(
  phone: string,
  userName: string,
  turfName: string,
  date: string,
  time: string,
  amount: string
) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.error("WhatsApp credentials missing");
    return { success: false };
  }

  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: "booking_confirmation", // Must match approved template name
      language: {
        code: "en"
      },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: userName },
            { type: "text", text: turfName },
            { type: "text", text: date },
            { type: "text", text: time },
            { type: "text", text: amount }
          ]
        }
      ]
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error("WhatsApp sending error:", error);
    return { success: false, error };
  }
}
