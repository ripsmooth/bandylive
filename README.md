# TorneoPal TV-overlay – moderni scorebug

Sisältää:
- `index.html`: läpinäkyvä TV-tulostaulu
- `api/live.js`: Vercelin serverless-välityspalvelin TorneoPalin XML-dataan

## Julkaisu Verceliin
1. Pura ZIP.
2. Lisää `index.html` ja `api/live.js` GitHub-repositorioon.
3. Vercelissä valitse Add New → Project ja tuo repositorio.
4. Paina Deploy.
5. Käytä Vercelin antamaa osoitetta OBS:n Browser Source -lähteessä.

## URL-parametrit
- `pvm=2026-11-25` – päivämäärä muodossa YYYY-MM-DD
- `turnaus=sjpl_2627` – turnaustunnus (oletus sjpl_2627)
- `ottelu=23556` – ottelun tunnus; ilman tätä valitaan käynnissä oleva ottelu tai listan ensimmäinen
- `scale=1.2` – skaalaus, esim. 0.8 tai 1.2
- `refresh=5` – päivitysväli sekunteina, sallitut 3–60

Esimerkki:
`https://oma-projekti.vercel.app/?pvm=2026-11-25&turnaus=sjpl_2627&ottelu=23556&scale=1.2&refresh=5`

## OBS-asetus
Lisää Lähteet → + → Selain. Syötä URL ja aseta lähteen kooksi esimerkiksi 900 × 180. Sivun tausta on läpinäkyvä.

Huom: ulkoasu ja välityspalvelin on toteutettu, mutta TorneoPal-kenttien (erityisesti logo-, pelikello- ja statustagit) nimet pitää tarkistaa käytännön live-testissä. Jos logon URL ei tule lähdedatassa kentissä `kotilogo` ja `vieraslogo`, nimikirjaimet näkyvät varalogona.
