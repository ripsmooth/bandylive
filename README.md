# TorneoPal Simple Scorebug + tapahtumien testipaneeli

## Sisältö
- `index.html` — läpinäkyvä tulostaulu OBS:ään.
- `api/live.js` — Vercel API -välityspalvelu TorneoPaliin.
- `ohjauspaneeli.html` — erillinen selaimessa toimiva testipaneeli.
- `testidata.json` — 13 historiallisen ottelun tapahtumat 7.12.2025 testitoistoa varten.

## Julkaisu
1. Kopioi kaikki tiedostot GitHub-repositorion juureen (säilytä `api/live.js` `api`-kansiossa).
2. Julkaise projekti Vercelissä.
3. OBS:n Browser Source -lähteeseen tulostauluosoite, esimerkiksi `https://OMA-PROJEKTI.vercel.app/?pvm=2026-11-25&turnaus=sjpl_2627&ottelu=23556&scale=1&refresh=5`.
4. Avaa ohjauspaneeli selaimessa: `https://OMA-PROJEKTI.vercel.app/ohjauspaneeli.html`.

## Ohjauspaneeli
Valitse 7.12.2025 pelattu ottelu ja käytä Toista, Tauko, Seuraava tapahtuma ja Alusta -painikkeita. Tapahtumat ovat oikeasta otteludatasta, mutta niiden toisto on simuloitu. Jäähyt kestävät testissä 6/10 sekuntia, jotta päättymisen voi nähdä nopeasti.

## Layoutin mitat
- Tulostaulun tavoiteleveys 900 px ja korkeus 54 px.
- Kotijoukkueen ja vierasjoukkueen lohkot jakavat jäljelle jäävän tilan keskiosan ja kellon jälkeen tasan.
- Tapahtuma- ja jäähyalueen tavoiteleveys 900 px.
- Pienissä selainleveyksissä leveys mukautuu näyttöön.

## Overlayn tapahtumasäännöt
- Uusin tapahtuma listan ylimmäksi.
- Enintään neljä tapahtumaa kerrallaan.
- Tapahtuma poistuu 20 sekunnin kuluttua sen havaitsemisesta.
- 6/10 minuutin jäähy näkyy aktiivisena ottelukellon perusteella jäähyn keston ajan.

Huom: varmista aktiivisten rangaistusten kentät oikealla liveottelulla ennen lähetyskäyttöä. Tämä versio käyttää TorneoPalin tapahtuma-aikaleimoja ja `kulunutaika`-kenttää.

## URL-parametrit
`?pvm=2026-11-25&turnaus=sjpl_2627&ottelu=23556&scale=1.0&refresh=5`


## Layout-asetukset
Avaa `layout.html` Vercel-julkaisussa. Sieltä voit muuttaa tulostaulun leveyttä ja korkeutta, joukkueiden, maalien, kellon ja tapahtumien tekstikokoja sekä kokonais skaalausta. Sivusto luo asetukset sisältävän URL-osoitteen. Käytä sitä OBS:n selainlähteessä. Parametrit: `width`, `height`, `teamfont`, `scorefont`, `clockfont`, `detailsfont`, `scale`.
