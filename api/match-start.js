export default async function handler(req, res) {
  const id = typeof req.query.ottelu === "string" ? req.query.ottelu : "";
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
  if (!/^\d{1,12}$/.test(id)) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(400).json({ error: "Virheellinen ottelutunnus." });
  }
  try {
    const target = `https://finbandy.torneopal.fi/taso/ottelu.php?ottelu=${encodeURIComponent(id)}`;
    const upstream = await fetch(target, {
      headers: { "User-Agent": "Bandylive-TV-Overlay/1.0", "Accept": "text/html,*/*" },
      cache: "no-store"
    });
    if (!upstream.ok) throw new Error(`Ottelusivu vastasi ${upstream.status}`);
    const html = await upstream.text();
    // TorneoPalin ottelusivulla suunniteltu alkamisaika on Klo-rivin TD-elementissä.
    const row = html.match(/<th[^>]*>\s*Klo\s*<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    const cell = row ? row[1].replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").trim() : "";
    const time = cell.match(/(?:^|\s)([01]?\d|2[0-3]):([0-5]\d)(?:\s|$)/);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).json({ klo: time ? `${time[1].padStart(2, "0")}:${time[2]}` : "" });
  } catch (error) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(502).json({ error: "Ottelun alkamisaikaa ei saatu haettua." });
  }
}
