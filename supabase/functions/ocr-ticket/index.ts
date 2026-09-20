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

// 보안: 이 함수는 호출할 때마다 유료 AI API 비용이 든다. anon 키는 공개된
// 값이라 그것만으로 호출을 허용하면 누구나 반복 호출로 비용을 쓰게 만들 수
// 있으므로 (1) 로그인한 사용자의 토큰만 허용하고 (2) 허용된 사이트에서 온
// 요청만 CORS로 열어주고 (3) 이미지 크기·형식을 제한한다.
const ALLOWED_ORIGINS = [
  "https://xn--on3b27no0awn.com", // 잘보여유.com
  "http://localhost:8793",
  "http://localhost:8791",
];
const MAX_IMAGE_BASE64_CHARS = 3_000_000; // 약 2.2MB — 앱은 미리 줄여서 보내므로 충분히 넉넉
const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function corsHeadersFor(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function jsonResponse(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeadersFor(req), "Content-Type": "application/json" },
  });
}

// 로그인한 사용자의 토큰인지 Supabase Auth에 확인한다 (anon 키는 여기서 거절됨).
async function isLoggedInUser(req: Request): Promise<boolean> {
  const auth = req.headers.get("authorization") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!auth.startsWith("Bearer ") || !supabaseUrl || !anonKey) return false;
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: auth },
    });
    if (!res.ok) return false;
    const user = await res.json();
    return !!(user && user.id);
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeadersFor(req) });
  }
  if (req.method !== "POST") {
    return jsonResponse(req, { ok: false, reason: "method_not_allowed" }, 405);
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    // Intentional/budget-related pause: no key configured. Not an error.
    return jsonResponse(req, { ok: false, reason: "disabled" });
  }

  if (!(await isLoggedInUser(req))) {
    return jsonResponse(req, { ok: false, reason: "unauthorized" }, 401);
  }

  let imageBase64: string | undefined;
  let mediaType: string | undefined;
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    mediaType = body.mediaType || "image/jpeg";
  } catch {
    return jsonResponse(req, { ok: false, reason: "bad_request" }, 400);
  }

  if (!imageBase64 || typeof imageBase64 !== "string") {
    return jsonResponse(req, { ok: false, reason: "no_image" }, 400);
  }
  if (imageBase64.length > MAX_IMAGE_BASE64_CHARS) {
    return jsonResponse(req, { ok: false, reason: "image_too_large" }, 413);
  }
  if (!ALLOWED_MEDIA_TYPES.includes(mediaType as string)) {
    return jsonResponse(req, { ok: false, reason: "bad_media_type" }, 400);
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
      return jsonResponse(req, { ok: false, reason: "api_error" });
    }

    const data = await anthropicResp.json();
    const text = data?.content?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return jsonResponse(req, { ok: false, reason: "parse_error" });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return jsonResponse(req, { ok: false, reason: "parse_error" });
    }

    return jsonResponse(req, { ok: true, data: parsed });
  } catch (e) {
    console.error("ocr-ticket function error:", e);
    return jsonResponse(req, { ok: false, reason: "server_error" });
  }
});
