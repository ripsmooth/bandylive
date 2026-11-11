#!/usr/bin/env python3
"""Päivitä Bandyliven Bandyliiga-pelaajarekisteri turvallisesti.

Hakee SportsPressin sivutetun pelaajalistan sarjatunnisteella 8.
Kirjoittaa JSON-tiedoston vasta, kun koko haku on onnistunut ja
perustarkistukset läpäisty.
"""
from __future__ import annotations

import argparse
import html
from html.parser import HTMLParser
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = "https://bandyliiga.fi/wp-json/sportspress/v2/players"
LEAGUE_ID = 8
PAGE_SIZE = 10  # Rajapinta palauttaa tällä hetkellä 10 pelaajaa/sivu.
MAX_PAGES = 400
REQUEST_DELAY_SECONDS = 1.5
REQUEST_TIMEOUT_SECONDS = 25
MIN_TOTAL_RECORDS = 300  # Suojaa vahingossa vajaaksi jäävältä haulta.
MIN_LEAGUE_PLAYERS = 250
OUTPUT = Path(__file__).resolve().parents[1] / "pelaajarekisteri.json"


class UpdateError(RuntimeError):
    pass


def get_json(url: str):
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Bandylive-player-registry-updater/1.0 (+daily cache refresh)",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            status = response.status
            body = response.read()
    except urllib.error.HTTPError as exc:
        # Erityisesti 429/503: ei automaattista uusintayritystä eikä vanhan datan korvausta.
        raise UpdateError(f"Rajapinta palautti HTTP {exc.code} ({url})") from exc
    except Exception as exc:
        raise UpdateError(f"Pyyntö epäonnistui ({url}): {exc}") from exc
    if status != 200:
        raise UpdateError(f"Odottamaton HTTP-status {status} ({url})")
    try:
        return json.loads(body.decode("utf-8"))
    except Exception as exc:
        raise UpdateError(f"Rajapinnan vastaus ei ollut kelvollista JSON-dataa ({url})") from exc


class TextOnlyHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
    def handle_data(self, data):
        self.parts.append(data)
    def text(self, value: str) -> str:
        self.feed(value)
        return " ".join(" ".join(self.parts).split())


def plain_text(value) -> str:
    if value is None:
        return ""
    parser = TextOnlyHTML()
    parser.text(html.unescape(str(value)))
    return html.unescape(" ".join(parser.parts)).strip()


def clean_name(player: dict) -> str:
    title = player.get("title") or {}
    rendered = title.get("rendered", "") if isinstance(title, dict) else str(title)
    return html.unescape(str(rendered)).strip()


def build_player(player: dict) -> dict:
    statistics = player.get("statistics") or {}
    league_stats = statistics.get(str(LEAGUE_ID), {}) if isinstance(statistics, dict) else {}
    season_stats = {}
    allowed_stat_fields = (
        "name", "team", "ottelut", "playoffottelut", "jhyminuutit", "nelj",
        "kulmamaali", "kolme", "winratio", "lossratio", "maalitperottelu",
    )
    if isinstance(league_stats, dict):
        for season_id, row in league_stats.items():
            # 0 on tilastokenttien otsikkorivi ja -1 uran yhteenveto, ei kausi.
            if str(season_id) in ("0", "-1") or not isinstance(row, dict):
                continue
            cleaned_row = {key: row[key] for key in allowed_stat_fields if key in row}
            if "team" in cleaned_row:
                cleaned_row["team"] = plain_text(cleaned_row["team"])
            season_stats[str(season_id)] = cleaned_row

    return {
        "id": player.get("id"),
        "name": clean_name(player),
        "slug": player.get("slug", ""),
        "url": player.get("link", ""),
        "modified": player.get("modified", ""),
        "number": player.get("number", ""),
        "teams": player.get("teams") or [],
        "current_teams": player.get("current_teams") or [],
        "seasons": player.get("seasons") or [],
        "season_stats": season_stats,
    }


def fetch_all_players() -> tuple[list[dict], int]:
    all_records: list[dict] = []
    seen_ids: set[int] = set()
    previous_page_ids: set[int] | None = None
    request_count = 0

    for page in range(1, MAX_PAGES + 1):
        query = urllib.parse.urlencode({"page": page})
        payload = get_json(f"{API}?{query}")
        request_count += 1
        if not isinstance(payload, list):
            raise UpdateError(f"Sivu {page}: odotettiin JSON-taulukkoa.")
        if not payload:
            break

        page_ids = {int(p["id"]) for p in payload if isinstance(p, dict) and p.get("id") is not None}
        if not page_ids:
            raise UpdateError(f"Sivu {page}: vastauksessa ei ollut pelaajien tunnisteita.")
        if previous_page_ids is not None and page_ids == previous_page_ids:
            raise UpdateError(f"Sivu {page} palautti saman sivun uudelleen; sivutus ei toimi.")
        previous_page_ids = page_ids

        for player in payload:
            if not isinstance(player, dict) or player.get("id") is None:
                raise UpdateError(f"Sivu {page}: virheellinen pelaajatietue.")
            player_id = int(player["id"])
            if player_id not in seen_ids:
                seen_ids.add(player_id)
                all_records.append(player)

        print(f"Sivu {page}: {len(payload)} tietuetta, yksilöllisiä yhteensä {len(all_records)}")
        if len(payload) < PAGE_SIZE:
            break
        if page == MAX_PAGES:
            raise UpdateError(f"Turvaraja {MAX_PAGES} sivua tuli vastaan; rekisteriä ei päivitetty.")
        time.sleep(REQUEST_DELAY_SECONDS)

    if len(all_records) < MIN_TOTAL_RECORDS:
        raise UpdateError(
            f"Vain {len(all_records)} pelaajatietuetta löytyi; vähintään {MIN_TOTAL_RECORDS} vaaditaan."
        )
    return all_records, request_count


def make_registry(all_records: list[dict]) -> dict:
    league_players = [p for p in all_records if LEAGUE_ID in (p.get("leagues") or [])]
    if len(league_players) < MIN_LEAGUE_PLAYERS:
        raise UpdateError(
            f"Bandyliigan pelaajia löytyi vain {len(league_players)}; vähintään {MIN_LEAGUE_PLAYERS} vaaditaan."
        )

    players = [build_player(p) for p in league_players]
    players.sort(key=lambda p: (p["name"].casefold(), int(p["id"])))
    return {
        "source": API,
        "generated_from": "Bandyliiga SportsPress API (league_id=8)",
        "league_id": LEAGUE_ID,
        "players": players,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-file", help="Testaa muunnos paikallisella täydellä JSON-vastauksella ilman verkkopyyntöjä.")
    parser.add_argument("--output", default=str(OUTPUT))
    args = parser.parse_args()

    try:
        if args.input_file:
            with open(args.input_file, encoding="utf-8") as f:
                all_records = json.load(f)
            if not isinstance(all_records, list):
                raise UpdateError("Testitiedoston pitää olla JSON-taulukko.")
            request_count = 0
        else:
            print("Aloitetaan pelaajarekisterin haku (yksi pyyntö kerrallaan, 1,5 s väli).")
            all_records, request_count = fetch_all_players()

        registry = make_registry(all_records)
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        temp = output.with_suffix(output.suffix + ".tmp")
        temp.write_text(json.dumps(registry, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        # Atominen korvaus: vanha rekisteri säilyy, jos kirjoitus keskeytyy.
        os.replace(temp, output)
        print(
            f"Päivitys onnistui: {len(all_records)} lähdetietuetta, "
            f"{len(registry['players'])} Bandyliigan pelaajaa, {request_count} HTTP-pyyntöä."
        )
        return 0
    except Exception as exc:
        print(f"PÄIVITYS EPÄONNISTUI: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
