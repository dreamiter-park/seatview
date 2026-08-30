// Serves /sitemap.xml with every visible venue's /venue/:id URL included,
// generated fresh on each request instead of a static file someone has to
// remember to regenerate every time a venue is added. The static pages
// (home, terms, privacy, event-terms) are kept here too so this one file
// stays the single source of truth for the sitemap.

const SUPABASE_URL = "https://zgdumfqkhqroehaszmau.supabase.co/rest/v1";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZHVtZnFraHFyb2VoYXN6bWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MDA2NDcsImV4cCI6MjEwMDQ3NjY0N30.ZtbbY2R0iKMtmNyB36EF6YRR62TRV-_l6huo87FQ41g";
const SITE = "https://xn--on3b27no0awn.com";

async function supabaseGet(path) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase request failed: ${res.status}`);
  return res.json();
}

exports.handler = async () => {
  let venues = [];
  try {
    venues = await supabaseGet(`/venues?select=id&order=id.asc`);
  } catch (e) {
    console.error("sitemap function: Supabase fetch failed", e);
    // Fall through and still return the static pages below rather than
    // failing the whole sitemap over a transient Supabase hiccup.
  }

  // Only seats with at least one real, non-blocked photo get their own
  // page (seat-page.js 404s on the rest) — pulling every review's
  // image_urls here and filtering client-side, since PostgREST has no
  // "array is non-empty" filter to push this down to the query itself.
  // Fine at today's volume; worth paginating if this list grows large.
  let seatIds = [];
  try {
    const reviews = await supabaseGet(
      `/musical_seat_reviews?is_blocked=eq.false&select=musical_seat_id,image_urls`
    );
    const withPhotos = reviews.filter((r) => Array.isArray(r.image_urls) && r.image_urls.length > 0);
    seatIds = [...new Set(withPhotos.map((r) => r.musical_seat_id).filter((id) => id != null))];
  } catch (e) {
    console.error("sitemap function: seat review fetch failed", e);
  }

  const staticUrls = [
    { loc: `${SITE}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${SITE}/terms.html`, changefreq: "yearly", priority: "0.3" },
    { loc: `${SITE}/privacy.html`, changefreq: "yearly", priority: "0.3" },
    { loc: `${SITE}/event-terms.html`, changefreq: "monthly", priority: "0.3" },
  ];

  const venueUrls = venues.map((v) => ({
    loc: `${SITE}/venue/${v.id}`,
    changefreq: "weekly",
    priority: "0.8",
  }));

  const seatUrls = seatIds.map((id) => ({
    loc: `${SITE}/seat/${id}`,
    changefreq: "monthly",
    priority: "0.6",
  }));

  const today = new Date().toISOString().slice(0, 10);
  const allUrls = [...staticUrls, ...venueUrls, ...seatUrls];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    allUrls
      .map(
        (u) =>
          `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Crawlers don't re-fetch sitemaps constantly anyway, so an hour of
      // CDN caching costs essentially nothing in freshness while saving a
      // Supabase round trip on repeat/overlapping crawler hits.
      "Cache-Control": "public, max-age=0, s-maxage=3600, must-revalidate",
    },
    body,
  };
};
