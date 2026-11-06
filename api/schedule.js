export default async function handler(req, res) {
  const date = typeof req.query.pvm === "string" ? req.query.pvm : "";
  const tournament = typeof req.query.turnaus === "string" ? req.query.turnaus : "sjpl_2627";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^[a-zA-Z0-9_-]{1,80}$/.test(tournament)) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(400).json({ error: "Virheelliset pvm- tai turnaus-parametrit." });
  }

  const origin = "https://finbandy.torneopal.fi";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fi-FI,fi;q=0.9,en;q=0.8",
    "Referer": origin + "/taso/"
  };
  const cookies = new Map();
  function saveCookies(response) {
    let values = [];
    try {
      if (typeof response.headers.getSetCookie === "function") values = response.headers.getSetCookie();
      else {
        const one = response.headers.get("set-cookie");
        if (one) values = one.split(/,(?=\s*[^;,\s]+=)/g);
      }
    } catch {}
    for (const item of values) {
      const pair = String(item).split(";", 1)[0];
      const eq = pair.indexOf("=");
      if (eq > 0) cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  }
  const cookieHeader = () => [...cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ");

  async function get(url) {
    let current = new URL(url);
    for (let i = 0; i < 6; i++) {
      if (current.hostname !== "finbandy.torneopal.fi") throw new Error("TorneoPal ohjasi odottamattomaan osoitteeseen.");
      const requestHeaders = { ...headers };
      const cookie = cookieHeader();
      if (cookie) requestHeaders.Cookie = cookie;
      const response = await fetch(current, {
        headers: requestHeaders,
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(7000)
      });
      saveCookies(response);
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) return { response, body: await response.text(), url: current };
        current = new URL(location, current);
        continue;
      }
      return { response, body: await response.text(), url: current };
    }
    throw new Error("TorneoPalin uudelleenohjauksia oli liikaa.");
  }

  function jsRedirect(body, baseUrl) {
    let encoded = "";
    const direct = body.match(/(?:window\.)?location\.replace\s*\(\s*atob\s*\(\s*["']([^"']+)["']\s*\)\s*\)/i);
    if (direct) encoded = direct[1];
    if (!encoded) {
      const call = body.match(/(?:window\.)?location\.replace\s*\(\s*atob\s*\(\s*([A-Za-z_$][\w$]*)\s*\)\s*\)/i);
      if (call) {
        const name = call[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const assignment = body.match(new RegExp("(?:^|[;\\s])(?:var\\s+|let\\s+|const\\s+)?" + name + "\\s*=\\s*['\\\"]([^'\\\"]+)['\\\"]", "m"));
        if (assignment) encoded = assignment[1];
      }
    }
    if (!encoded) return null;
    try {
      const decoded = Buffer.from(encoded, "base64").toString("utf8");
      const next = new URL(decoded, baseUrl);
      return next.hostname === "finbandy.torneopal.fi" && next.pathname.startsWith("/taso/") ? next : null;
    } catch { return null; }
  }

  const decode = value => String(value || "")
    .replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
  const plain = value => decode(String(value || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ").trim();
  const norm = value => plain(value).toLocaleLowerCase("fi-FI").normalize("NFKC");
  function classValue(block, classNames) {
    for (const name of classNames) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`<(?:div|span)\\b[^>]*class=['"][^'"]*\\b${escaped}\\b[^'"]*['"][^>]*>([\\s\\S]*?)<\\/(?:div|span)>`, "i");
      const match = block.match(re);
      if (match) return plain(match[1]);
    }
    return "";
  }
  function matchesDate(raw) {
    const match = String(raw || "").match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})?/);
    if (!match) return false;
    const [, day, month, year] = match;
    const [wantedYear, wantedMonth, wantedDay] = date.split("-");
    return Number(day) === Number(wantedDay) && Number(month) === Number(wantedMonth) && (!year || Number(year.length === 2 ? "20" + year : year) === Number(wantedYear));
  }
  function extractMatches(html, series) {
    const anchors = html.match(/<a\b[^>]*href=['"][^'"]*ottelu=\d+[^'"]*['"][^>]*>[\s\S]*?<\/a>/gi) || [];
    const rows = [];
    for (const block of anchors) {
      const id = (block.match(/ottelu=(\d+)/i) || [])[1] || "";
      if (!id) continue;
      const listedDate = classValue(block, ["ml_pvmsiisti", "ml_pvm"]);
      if (!matchesDate(listedDate)) continue;
      const timeRaw = classValue(block, ["ml_tulosklo"]);
      const timeMatch = timeRaw.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
      const home = classValue(block, ["ml_kotisiisti"]);
      const away = classValue(block, ["ml_vierassiisti"]);
      rows.push({
        id,
        sarja: series,
        pvm: date,
        paivays: listedDate,
        koti: home,
        vieras: away,
        klo: timeMatch ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}` : ""
      });
    }
    return rows;
  }
  async function followPage(url) {
    let result = await get(url);
    for (let attempt = 0; attempt < 2 && !(/<li\b[^>]*class=['"][^'"]*\bmatch\b/i.test(result.body) || /ml_tulosklo/i.test(result.body)); attempt++) {
      const next = jsRedirect(result.body, result.url || url);
      if (next) result = await get(next);
      else if (attempt === 0) result = await get(url);
      else break;
    }
    return result;
  }

  try {
    // Read the public navigation to discover every published series in this season.
    const home = await followPage(new URL("/taso/", origin));
    const series = new Set();
    const links = home.body.match(/href\s*=\s*['"][^'"]*\/taso\/sarja\.php\?[^'"]*['"]/gi) || [];
    for (const item of links) {
      const href = decode((item.match(/['"]([^'"]+)['"]/) || [])[1] || "");
      try {
        const url = new URL(href, origin);
        if (url.hostname !== "finbandy.torneopal.fi") continue;
        const params = url.searchParams;
        if (params.get("turnaus") === tournament) {
          const code = params.get("sarja");
          if (code && /^[a-zA-Z0-9_-]{1,40}$/.test(code)) series.add(code);
        }
      } catch {}
    }
    // Fallback for the known 2026–27 public menu if the navigation markup changes.
    if (!series.size && tournament === "sjpl_2627") {
      ["MBL", "NBL", "MSC", "NSC", "DIV", "PIC", "NUBL", "U16", "U14", "U12", "U10", "PP12", "PP10", "Piiri"].forEach(x => series.add(x));
    }

    const seriesList = [...series];
    // Request all category schedules in parallel. The pages are only fetched once
    // by the browser per selected date, not on every live-score refresh.
    const results = await Promise.all(seriesList.map(async code => {
      const target = new URL("/taso/sarja.php", origin);
      target.searchParams.set("turnaus", tournament);
      target.searchParams.set("sarja", code);
      target.searchParams.set("ottelut", "1");
      try {
        const result = await followPage(target);
        if (!result.response.ok) return [];
        return extractMatches(result.body, code);
      } catch { return []; }
    }));
    const matches = results.flat();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("X-BandyLive-Schedule-Series", String(seriesList.length));
    return res.status(200).json({ pvm: date, turnaus: tournament, series: seriesList, count: matches.length, matches });
  } catch (error) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(502).json({ error: "TorneoPalin otteluohjelman haku epäonnistui.", detail: String(error?.message || error) });
  }
}
