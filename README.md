# TorneoPal Simple Scorebug

Pieni, kulmikas tulostaulu Slant-tyylin innoittamana: joukkueet, tulos ja kello. Ei suurta kehystä, logoja voi näyttää lähdedatan perusteella ja muuten käytetään joukkueen nimikirjaimia.

## Julkaisu
1. Pura ZIP.
2. Lisää `index.html` sekä `api/live.js` GitHub-repositorioon.
3. Tuo repositorio Verceliin ja julkaise.
4. Lisää Vercelin URL OBS:n Browser Source -lähteeksi.

## Parametrit
`?pvm=2026-11-25&turnaus=sjpl_2627&ottelu=23556&scale=1.0&refresh=5`

- `pvm`: päivämäärä YYYY-MM-DD
- `turnaus`: turnaustunnus
- `ottelu`: ottelutunnus; jos puuttuu, valitaan käynnissä oleva tai ensimmäinen ottelu
- `scale`: koko, esim. 0.8 tai 1.2
- `refresh`: päivitysväli sekunteina (3–60)

Huom: julkaisu ja live-testit pitää tehdä omassa Vercel-ympäristössä. TorneoPalin logo- ja kellokenttien nimet on hyvä varmistaa oikealla liveottelulla.
