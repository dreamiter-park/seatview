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

  // 요청 헤더의 호스트 값을 그대로 쓰면, 조작된 헤더로 다른 사이트의 HTML을
  // 가져와 우리 도메인의 페이지처럼 내보내게 만들 수 있다 — 허용 목록만 쓰고
  // 그 외에는 대표 도메인으로 고정한다.
  const ALLOWED_HOSTS = ["xn--on3b27no0awn.com", "www.xn--on3b27no0awn.com"];
  const reqHost = event.headers["x-forwarded-host"] || event.headers.host;
  const origin = ALLOWED_HOSTS.includes(reqHost) ? `https://${reqHost}` : "https://xn--on3b27no0awn.com";

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
        `musical_seat_reviews(image_urls,content,is_ticket_verified,watched_date,user_id,is_anonymous,ins_dtm)` +
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

  // Google's Review rich-result validator flagged two real problems here
  // (via a Search Console email): "PerformingArtsTheater" isn't one of the
  // types Google supports as itemReviewed for a Review snippet, and
  // "author" is required but was missing entirely. Also fixed along the
  // way: reviewBody was joining every review on the seat into one string
  // under a single fake Review — schema.org's Review is meant to be one
  // person's review, so this now only describes the most recent one
  // (all photos across every review still show up in `image`, and on the
  // page itself).
  const primaryReview = reviews[0];
  let authorName = "잘보여유 이용자";
  if (primaryReview && !primaryReview.is_anonymous && primaryReview.user_id) {
    try {
      const profiles = await supabaseGet(`/profiles_public?id=eq.${primaryReview.user_id}&select=nickname&limit=1`);
      if (profiles[0] && profiles[0].nickname) authorName = profiles[0].nickname;
    } catch (e) {
      console.error("seat-page function: nickname fetch failed", e);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "LocalBusiness",
      name: venue.name,
    },
    author: {
      "@type": "Person",
      name: authorName,
    },
    // Google's own docs: reviewRating is normally required too, but can be
    // omitted "if your marked-up content contains both an author and a
    // review date" — we have no real star-rating data to report (this app
    // never collects one), so datePublished is what earns that exemption
    // instead of fabricating a rating. ins_dtm (registration date) is used
    // over watched_date since the latter can be null.
    datePublished: (primaryReview && primaryReview.ins_dtm) || undefined,
    name: fullLabel,
    reviewBody: (primaryReview && primaryReview.content) || undefined,
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

  // See venue-page.js for why this needs position:fixed (flex-layout
  // squish) and why the first-fold content is a loading spinner rather
  // than the crawler text itself (a wall of text flashing then vanishing
  // read as "a broken page" even once the squish was fixed — the text is
  // still genuinely present just below the fold, so this isn't cloaking).
  const seoContentHtml = `
<div id="ssr-seo-content" style="position:fixed;inset:0;z-index:9999;overflow-y:auto;background:var(--bg-app,#080a0f);color:var(--text-primary,#f3f4f6);">
  <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;">
    <img src="/assets/header-logo.png" alt="잘보여유" style="height:28px;">
    <div style="width:26px;height:26px;border:3px solid rgba(255,255,255,0.15);border-top-color:#8b5cf6;border-radius:50%;animation:ssr-spin 0.8s linear infinite;"></div>
    <style>@keyframes ssr-spin{to{transform:rotate(360deg)}}</style>
  </div>
  <div style="max-width:640px;margin:0 auto;padding:0 16px 20px;font-family:sans-serif;line-height:1.6;">
    <h1>${escapeHtml(fullLabel)} 좌석 시야</h1>
    <p>${escapeHtml(venue.address || "")}</p>
    ${photosHtml}
    ${reviewTextHtml}
    <p>${escapeHtml(fullLabel)}의 실제 관람객이 등록한 좌석 시야 사진과 후기를 앱에서 바로 확인하실 수 있습니다.</p>
  </div>
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
    // netlify.toml의 [[headers]]는 함수 응답에는 적용되지 않아서 여기서 직접 넣는다.
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy": "object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
    },
    body: html,
  };
};
