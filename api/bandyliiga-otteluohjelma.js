export default async function handler(req, res) {
  const turnaus = typeof req.query.turnaus === "string" ? req.query.turnaus : "sjpl_2627";
  const sarja = typeof req.query.sarja === "string" ? req.query.sarja : "MBL";
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(turnaus) || !/^[a-zA-Z0-9_-]{1,40}$/.test(sarja)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(400).send("Virheelliset turnaus- tai sarja-parametrit.");
  }
  const target = new URL("https://finbandy.torneopal.fi/taso/sarja.php");
  target.searchParams.set("turnaus", turnaus);
  target.searchParams.set("sarja", sarja);
  target.searchParams.set("ottelut", "1");
  try {
    const upstream = await fetch(target, {
      headers: { "User-Agent": "TorneoPal-Bandyliiga-Overlay/1.0", Accept: "text/html,*/*" },
      cache: "no-store",
    });
    const body = await upstream.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(upstream.status).send(body);
  } catch {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(502).send("Bandyliigan otteluohjelman haku epäonnistui.");
  }
}
