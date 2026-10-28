import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

type SmsHookPayload = {
  user?: { phone?: unknown };
  sms?: { otp?: unknown };
};

function jsonResponse(body: Record<string, string>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const hookSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
  const apiKey = Deno.env.get("AFRICASTALKING_API_KEY");
  const username = Deno.env.get("AFRICASTALKING_USERNAME");
  if (!hookSecret || !apiKey || !username) {
    return jsonResponse({ error: "SMS delivery is not configured" }, 500);
  }

  try {
    const rawBody = await request.text();
    const webhook = new Webhook(hookSecret.replace(/^v1,whsec_/, ""));
    const payload = webhook.verify(rawBody, Object.fromEntries(request.headers)) as SmsHookPayload;
    const phone = payload.user?.phone;
    const otp = payload.sms?.otp;
    if (
      typeof phone !== "string" ||
      !/^\+255[67]\d{8}$/.test(phone) ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return jsonResponse({ error: "Invalid SMS challenge" }, 400);
    }

    const form = new URLSearchParams({
      username,
      to: phone,
      message: `Your KBestoreTZ verification code is ${otp}. Do not share this code.`,
    });
    const senderId = Deno.env.get("AFRICASTALKING_SENDER_ID");
    if (senderId) form.set("from", senderId);

    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey,
      },
      body: form,
    });
    const result = await response.json() as {
      SMSMessageData?: { Recipients?: { status?: unknown }[] };
    };
    const recipients = result.SMSMessageData?.Recipients;
    const deliveredToQueue =
      response.ok && recipients?.some((recipient) => recipient.status === "Success");
    if (!deliveredToQueue) {
      return jsonResponse({ error: "SMS provider did not accept the message" }, 502);
    }

    return new Response("{}", { status: 200 });
  } catch {
    return jsonResponse({ error: "Unable to deliver verification SMS" }, 500);
  }
});
