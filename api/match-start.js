export default async function handler(req, res) {
  const date = typeof req.query.pvm === "string" ? req.query.pvm : "";
  const home = typeof req.query.koti === "string" ? req.query.koti : "";
  const away = typeof req.query.vieras === "string" ? req.query.vieras : "";
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !home || !away) {
    return res.status(400).json({ error: "Anna pvm, koti ja vieras." });
  }

  const norm = value => decodeEntities(String(value || ""))
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ").trim().toLocaleLowerCase("fi-FI");
  function decodeEntities(value) {
    return value.replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
      .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
  }
  try {
    const target = "https://finbandy.torneopal.fi/taso/sarja.php?turnaus=sjpl_2627&sarja=MBL&ottelut=1";
    const upstream = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,*/*",
        "Accept-Language": "fi-FI,fi;q=0.9,en;q=0.8",
        "Referer": "https://finbandy.torneopal.fi/"
      }, cache: "no-store"
    });
    const html = await upstream.text();
    const pageTitle = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const pageDebug = { httpStatus: upstream.status, finalUrl: upstream.url || target, htmlLength: html.length, title: pageTitle, hasMatchList: /id=["']olista["']|class=["'][^"']*matchlist/i.test(html), hasKickoffClass: /ml_tulosklo/i.test(html) };
    if (!upstream.ok) throw new Error(`Otteluohjelma vastasi ${upstream.status}`);

    const [year, month, day] = date.split("-");
    const wantedDate = `${Number(day)}.${Number(month)}.`;
    const wantedHome = norm(home), wantedAway = norm(away);
    const anchors = html.match(/<a\b[^>]*href=['"][^'"]*ottelu=\d+[^'"]*['"][^>]*>[\s\S]*?<\/a>/gi) || [];
    for (const block of anchors) {
      const idMatch = block.match(/ottelu=(\d+)/i);
      const get = cls => {
        const re = new RegExp(`<div\\b[^>]*class=['"][^'"]*\\b${cls}\\b[^'"]*['"][^>]*>([\\s\\S]*?)<\\/div>`, "i");
        const m = block.match(re);
        return m ? norm(m[1]) : "";
      };
      const listedDate = get("ml_pvmsiisti");
      const listedHome = get("ml_kotisiisti");
      const listedAway = get("ml_vierassiisti");
      const timeRaw = get("ml_tulosklo");
      if ((listedDate === wantedDate || listedDate.startsWith(wantedDate)) && listedHome === wantedHome && listedAway === wantedAway) {
        const time = timeRaw.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
        return res.status(200).json({
          klo: time ? `${time[1].padStart(2, "0")}:${time[2]}` : "",
          debug: { date: listedDate, koti: listedHome, vieras: listedAway, scheduleMatchId: idMatch?.[1] || "", source: target }
        });
      }
    }
    return res.status(200).json({ klo: "", debug: { date: wantedDate, koti: wantedHome, vieras: wantedAway, scheduleRows: anchors.length, ...pageDebug, source: target } });
  } catch (error) {
    return res.status(502).json({ error: "Otteluohjelman kellonaikaa ei saatu haettua.", detail: String(error?.message || error) });
  }
}
