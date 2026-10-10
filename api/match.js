export default async function handler(req, res) {
  const matchId = typeof req.query.ottelu === "string" ? req.query.ottelu : "";
  if (!/^\\d{1,12}$/.test(matchId)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(400).send("Virheellinen ottelun tunniste.");
  }
  const target = new URL("https://finbandy.torneopal.fi/taso/ottelu.php");
  target.searchParams.set("ottelu", matchId);
  try {
    const upstream = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BandyLiveOverlay/1.0)",
        "Accept": "text/html,application/xhtml+xml"
      },
      cache: "no-store"
    });
    const body = await upstream.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(upstream.status).send(body);
  } catch {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(502).send("TorneoPal-ottelusivun haku epäonnistui.");
  }
}
