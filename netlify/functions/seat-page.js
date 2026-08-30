// Renders a seat-specific version of index.html for search engines and
// direct links (/seat/:id) — the long-tail queries people actually type
// ("샤롯데씨어터 2층 A구역 4열 4번 시야") name an exact seat, not just a venue,
// so a venue-level page alone can't rank for them. Only seats that already
// have at least one real, non-blocked review with a photo get a page here
// (see app_v6.js's earlier discussion) — an empty seat page would just be
// thin duplicate-ish content dragging the rest of the site down.
//
// Same approach as venue-page.js: fetch the real, currently-deployed
// index.html and rewrite the per-page bits, so this never drifts out of
// sync with the actual app shell. No npm dependencies — Node 18's built-in
// fetch is all this needs.

const SUPABASE_URL = "https://zgdumfqkhqroehaszmau.supabase.co/rest/v1";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZHVtZnFraHFyb2VoYXN6bWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MDA2NDcsImV4cCI6MjEwMDQ3NjY0N30.ZtbbY2R0iKMtmNyB36EF6YRR62TRV-_l6huo87FQ41g";

// JSON.stringify doesn't escape "<", so a review whose content contains
// the literal text "</script>" would prematurely close this script tag
// and let the rest of the value execute as real HTML/JS — reviewBody
// here is raw user-submitted text with no moderation gate before it's
// live, so this is a real stored-XSS vector, not just a theoretical one.
// < is valid inside a JSON string and round-trips through JSON.parse
// fine, so this only changes what the raw HTML looks like.
function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function supabaseGet(path) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase request failed: ${res.status}`);
  return res.json();
}

function seatLabel(seat) {
  const hasSeatNum = seat.seat_num !== null && seat.seat_num !== undefined && seat.seat_num !== "";
  if (!hasSeatNum) return `${seat.row_num}열 장애인석`;
  return `${seat.row_num}열 ${seat.seat_num}번`;
}

exports.handler = async (event) => {
  const idMatch = (event.path || "").match(/\/seat\/(\d+)/);
  const id = (event.queryStringParameters && event.queryStringParameters.id) || (idMatch && idMatch[1]);
  if (!id || !/^\d+$/.test(id)) {
    return { statusCode: 404, body: "Not found" };
  }

  const host = event.headers["x-forwarded-host"] || event.headers.host;
  const origin = `https://${host}`;

  let seat, block, venue, reviews;
  try {
    // One request instead of four sequential round trips — PostgREST
    // follows the real FK relationships (musical_seats -> musical_blocks
    // -> venues, and the reverse musical_seats -> musical_seat_reviews) to
    // embed everything in a single response. Verified against the live
    // schema before relying on it here.
    const seats = await supabaseGet(
      `/musical_seats?id=eq.${id}&select=id,row_num,seat_num,` +
        `musical_blocks(id,venue_id,floor,full_name,block_code,venues(id,name,address)),` +
        `musical_seat_reviews(image_urls,content,is_ticket_verified,watched_date)` +
        `&musical_seat_reviews.is_blocked=eq.false&musical_seat_reviews.order=ins_dtm.desc&limit=1`
    );
    seat = seats[0];
    if (!seat) return { statusCode: 404, body: "Seat not found" };
    block = seat.musical_blocks;
    if (!block) return { statusCode: 404, body: "Block not found" };
    venue = block.venues;
    if (!venue) return { statusCode: 404, body: "Venue not found" };
    reviews = seat.musical_seat_reviews || [];
  } catch (e) {
    console.error("seat-page function: Supabase fetch failed", e);
    return { statusCode: 502, body: "Upstream error" };
  }

  const photoUrls = [];
  reviews.forEach((r) => {
    if (Array.isArray(r.image_urls)) photoUrls.push(...r.image_urls.filter(Boolean));
  });

  // No real content to show — this is exactly the "thin page" case we
  // decided to skip rather than generate for every seat regardless.
  if (photoUrls.length === 0) {
    return { statusCode: 404, body: "No photos registered for this seat yet" };
  }

  let indexHtml;
  try {
    const indexRes = await fetch(`${origin}/index.html`);
    indexHtml = await indexRes.text();
  } catch (e) {
    console.error("seat-page function: failed to fetch index.html", e);
    return { statusCode: 502, body: "Upstream error" };
  }

  const blockLabel = block.full_name || (block.block_code ? `${block.block_code}구역` : `${block.floor}층`);
  const seatLbl = seatLabel(seat);
  const fullLabel = `${venue.name} ${blockLabel} ${seatLbl}`;

  const title = `${fullLabel} 좌석 시야 후기 | 잘보여유`;
  const description = `${fullLabel}에서 실제 관람객이 등록한 좌석 시야 사진과 후기입니다. 뮤지컬·연극 공연장 좌석 시야 공유 서비스 잘보여유.`;
  const canonicalUrl = `https://xn--on3b27no0awn.com/seat/${id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "PerformingArtsTheater",
      name: venue.name,
    },
    name: fullLabel,
    reviewBody: reviews.map((r) => r.content).filter(Boolean).join(" / ") || undefined,
    image: photoUrls,
  };

  const photosHtml = photoUrls
    .slice(0, 6)
    .map((u) => `<img src="${escapeHtml(u)}" alt="${escapeHtml(fullLabel)} 시야 사진" style="max-width:100%;border-radius:8px;margin-bottom:10px;" loading="lazy">`)
    .join("\n");

  const reviewTextHtml = reviews
    .filter((r) => r.content)
    .slice(0, 5)
    .map((r) => `<p>${escapeHtml(r.content)}</p>`)
    .join("\n");

  const seoContentHtml = `
<div id="ssr-seo-content" style="max-width:640px;margin:0 auto;padding:20px 16px;font-family:sans-serif;line-height:1.6;">
  <h1>${escapeHtml(fullLabel)} 좌석 시야</h1>
  <p>${escapeHtml(venue.address || "")}</p>
  ${photosHtml}
  ${reviewTextHtml}
  <p>${escapeHtml(fullLabel)}의 실제 관람객이 등록한 좌석 시야 사진과 후기를 앱에서 바로 확인하실 수 있습니다.</p>
</div>`;

  const titleTag = escapeHtml(title);
  const descTag = escapeHtml(description);
  let html = indexHtml
    .replace(/<title>[^<]*<\/title>/, () => `<title>${titleTag}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${descTag}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, () => `<meta property="og:title" content="${titleTag}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, () => `<meta property="og:description" content="${descTag}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, () => `<meta property="og:url" content="${canonicalUrl}">`)
    .replace(
      "</head>",
      () => `<link rel="canonical" href="${canonicalUrl}">\n<script type="application/ld+json">${safeJsonLd(jsonLd)}</script>\n</head>`
    )
    .replace("<body>", () => `<body>\n${seoContentHtml}`);

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: html,
  };
};
