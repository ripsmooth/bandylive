export default async function handler(req, res) {
  const matchId = typeof req.query.ottelu === "string" ? req.query.ottelu : "";
  if (!/^\d{1,12}$/.test(matchId)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(400).send("Virheellinen ottelun tunniste.");
  }

  const target = new URL("https://finbandy.torneopal.fi/taso/ottelu.php");
  target.searchParams.set("ottelu", matchId);
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fi-FI,fi;q=0.9,en;q=0.8",
    "Referer": "https://finbandy.torneopal.fi/taso/"
  };

  try {
    async function get(url) {
      const response = await fetch(url, { headers, cache: "no-store", redirect: "follow" });
      return { response, body: await response.text() };
    }

    let { response: upstream, body } = await get(target);

    // TorneoPal may return a JavaScript redirect page. Some pages store the
    // base64 path in a variable and then call atob(variable), rather than
    // passing the encoded string directly to atob().
    if (!/class\s*=\s*["'][^"']*pelaajalista/i.test(body)) {
      let encodedValue = "";
      const direct = body.match(/(?:window\.location\.replace|location\.replace)\s*\(\s*atob\(\s*["']([^"']+)["']\s*\)/i);
      if (direct) encodedValue = direct[1];
      if (!encodedValue) {
        const redirect = body.match(/(?:window\.)?location\.replace\s*\(\s*atob\(\s*([A-Za-z_$][\w$]*)\s*\)\s*\)/i);
        if (redirect) {
          const variable = redirect[1];
          const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const assignment = body.match(new RegExp("(?:^|[;\\s])(?:var\\s+|let\\s+|const\\s+)?" + escaped + "\\s*=\\s*['\\\"]([^'\\\"]+)['\\\"]", "m"));
          if (assignment) encodedValue = assignment[1];
        }
      }
      if (encodedValue) {
        const redirectedPath = Buffer.from(encodedValue, "base64").toString("utf8");
        if (redirectedPath.startsWith("/taso/") && !redirectedPath.startsWith("//")) {
          const next = new URL(redirectedPath, "https://finbandy.torneopal.fi");
          if (next.hostname === "finbandy.torneopal.fi") {
            const result = await get(next);
            upstream = result.response;
            body = result.body;
          }
        }
      }
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(upstream.status).send(body);
  } catch {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(502).send("TorneoPal-ottelusivun haku epäonnistui.");
  }
}
