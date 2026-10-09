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


## Verkossa käytettävät tulostauluasetukset

Ohjauspaneelin live-asetukset lisätään tulostaulun URL-osoitteeseen. Tämä toimii eri tietokoneilla ja OBS:ssä, koska asetukset ovat URL-parametreissa. Avaa `ohjauspaneeli.html`, syötä julkaistun `index.html`-tiedoston täydellinen HTTPS-osoite ja valitse asetukset. Paina **Luo live-osoite** ja **Kopioi osoite**. Liitä valmis osoite OBS:n selaimen lähteen URL-kenttään. Kun asetuksia muutetaan myöhemmin, luo uusi osoite ja päivitä OBS:n URL. Tämä versio ei tarvitse erillistä tietokantaa tai paikallista selaintallennusta.

Tuetut parametrit: `count` (1–10), `duration` (5–120 sekuntia), `width` (400–1400 px), `order=newest|oldest`, `empty=hide|message`, `showEvents=0|1`, `showPenalties=0|1`, `refresh` (3–60 sekuntia), sekä olemassa olevat `turnaus`, `pvm`, `ottelu` ja `scale`.
