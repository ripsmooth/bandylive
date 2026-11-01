export default async function handler(req, res) {
  const id = typeof req.query.ottelu === "string" ? req.query.ottelu : "";
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!/^\d{1,12}$/.test(id)) {
    return res.status(400).json({ error: "Virheellinen ottelutunnus." });
  }
  try {
    const target = `https://finbandy.torneopal.fi/taso/ottelu.php?ottelu=${encodeURIComponent(id)}&content=1`;
    const upstream = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fi-FI,fi;q=0.9,en;q=0.8",
        "Referer": "https://finbandy.torneopal.fi/"
      },
      cache: "no-store"
    });
    const html = await upstream.text();
    if (!upstream.ok) throw new Error(`Ottelusivu vastasi ${upstream.status}`);

    // Ensisijaisesti poimitaan kellonaika Klo-rivin solusta.
    let cell = "";
    const row = html.match(/<th\b[^>]*>\s*Klo\s*<\/th>\s*<td\b[^>]*>([\s\S]*?)<\/td>/i);
    if (row) cell = row[1];

    // Varavaihtoehto: poimitaan Klo-otsikon jälkeinen teksti HTML-tageista riippumatta.
    if (!cell) {
      const plain = html
        .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;|&#160;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/\s+/g, " ");
      const at = plain.search(/\bKlo\b/i);
      if (at >= 0) cell = plain.slice(at + 3, at + 100);
    }

    const text = cell
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim();
    const time = text.match(/(?:^|\s)([01]?\d|2[0-3]):([0-5]\d)(?=\s|$|\()/);
    return res.status(200).json({ klo: time ? `${time[1].padStart(2, "0")}:${time[2]}` : "", debug: { id, httpStatus: upstream.status, foundKloLabel: /\bKlo\b/i.test(html), matchedCell: Boolean(row), preview: (text || html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()).slice(0, 160), source: target } });
  } catch (error) {
    return res.status(502).json({ error: "Ottelun alkamisaikaa ei saatu haettua." });
  }
}
