// Reads a musical/concert or baseball ticket photo and extracts venue/seat/
// date fields via Claude's vision API. The Anthropic API key lives ONLY in
// this function's server-side environment (an Edge Function secret) — it
// is never sent to, or readable by, the client. The client sends a photo
// and gets back plain extracted text fields; nothing else.
//
// Deploy: supabase functions deploy ocr-ticket
// Secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Cost control: if ANTHROPIC_API_KEY isn't set (or is cleared later to pause
// the feature for budget reasons), this returns { ok:false, reason:"disabled" }
// and the client falls back to manual entry — no code change needed to turn
// the feature off, just remove the secret.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, reason: "method_not_allowed" }, 405);
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    // Intentional/budget-related pause: no key configured. Not an error.
    return jsonResponse({ ok: false, reason: "disabled" });
  }

  let imageBase64: string | undefined;
  let mediaType: string | undefined;
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    mediaType = body.mediaType || "image/jpeg";
  } catch {
    return jsonResponse({ ok: false, reason: "bad_request" }, 400);
  }

  if (!imageBase64) {
    return jsonResponse({ ok: false, reason: "no_image" }, 400);
  }

  // Deliberately NOT asking the model to split the seat location into
  // separate floor/block/row/seatNum fields — across several real tickets
  // it kept reading the text fine but misassigning it (e.g. "1층 C구역 16열
  // 4번" came back as block="구역 16", row="4", seatNum=null — it dropped
  // "C" and shifted everything over by one). Transcription is a task vision
  // models are good at; semantic field-splitting of Korean seat notation
  // apparently isn't reliable at this model size. So: ask for the seat text
  // verbatim and parse it ourselves, client-side, where the parsing logic
  // can actually be tested and fixed without a redeploy.
  const prompt = `이 이미지는 공연/뮤지컬/콘서트/야구 경기 티켓 사진입니다. 다음 정보를 오직 JSON으로만 응답해줘 (설명 문장 없이 JSON 객체 하나만):
{
  "venue": "공연장 또는 야구장 이름 (예: 샤롯데씨어터, 잠실야구장) — 못 읽으면 null",
  "date": "관람일, YYYY-MM-DD 형식 — 못 읽으면 null",
  "grade": "가격/좌석 등급명 (예: R석, S석, A석, VIP석) — 없거나 못 읽으면 null",
  "seatText": "좌석 위치를 나타내는 문구를 티켓에 적힌 그대로, 토씨 하나 빠뜨리지 말고 그대로 옮겨 적어줘. 절대 요약하거나 해석하지 말 것. (예: '1층 C구역 16열 4번', '1층 D열 41번', '1층 5열 22번') — 못 읽으면 null"
}
티켓이 아니거나 정보를 전혀 읽을 수 없으면 모든 필드를 null로 응답해줘.`;

  try {
    const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!anthropicResp.ok) {
      const errText = await anthropicResp.text();
      console.error("Anthropic API error:", anthropicResp.status, errText);
      // Billing/quota/rate-limit errors land here too — surface all of them
      // the same way so the client just falls back to manual entry rather
      // than trying to distinguish "out of budget" from "network hiccup".
      return jsonResponse({ ok: false, reason: "api_error" });
    }

    const data = await anthropicResp.json();
    const text = data?.content?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return jsonResponse({ ok: false, reason: "parse_error" });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return jsonResponse({ ok: false, reason: "parse_error" });
    }

    return jsonResponse({ ok: true, data: parsed });
  } catch (e) {
    console.error("ocr-ticket function error:", e);
    return jsonResponse({ ok: false, reason: "server_error" });
  }
});
