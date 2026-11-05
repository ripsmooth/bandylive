export default async function handler(req, res) {
  const teamId = typeof req.query.joukkue === "string" ? req.query.joukkue : "";
  const tournament = typeof req.query.turnaus === "string" ? req.query.turnaus : "sjpl_2627";
  const series = typeof req.query.sarja === "string" ? req.query.sarja : "MBL";
  if (!/^\\d{1,12}$/.test(teamId) || !/^[a-zA-Z0-9_-]{1,40}$/.test(tournament) || !/^[a-zA-Z0-9_-]{1,20}$/.test(series)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(400).send("Virheelliset joukkueen tilastohakuehdot.");
  }
  const target = new URL("https://finbandy.torneopal.fi/taso/joukkue.php");
  target.searchParams.set("joukkue", teamId);
  target.searchParams.set("turnaus", tournament);
  target.searchParams.set("sarja", series);
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
    return res.status(502).send("TorneoPal-joukkueen kausitilastojen haku epäonnistui.");
  }
}
