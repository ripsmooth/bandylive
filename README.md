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

## Erillinen Lower Third -grafiikka
- `lowerthird.html` — läpinäkyvä, noin 1400 × 300 px grafiikka ennakkoon, erätauolle tai ottelun jälkeen. Näyttää joukkueiden logot ja nimet, tilanteen, peliajan sekä maalintekijät kahdessa sarakkeessa. Jokainen maali näytetään omalla rivillään.
- `lowerthird-ohjauspaneeli.html` — luo grafiikalle erillisen URL-osoitteen, jossa voi asettaa ottelupäivän, turnauksen, ottelun ID:n, päivitysvälin, leveyden, korkeuden ja skaalauksen.

Grafiikka käyttää samaa `/api/live`-välityspalvelua kuin nykyinen tulostaulu. Nykyistä `index.html`-tulostaulua tai sen asetuksia ei muuteta. Julkaisun jälkeen ohjauspaneeli löytyy osoitteesta `https://OMA-PROJEKTI.vercel.app/lowerthird-ohjauspaneeli.html`.

## Grafiikoiden etäohjaus puhelimella tai toisella tietokoneella

Uusi sivu `grafiikkaohjaus.html` ohjaa tulostaulun (`index.html`) ja Lower Thirdin (`lowerthird.html`) näkyvyyttä. Grafiikat tarkistavat yhteisen tilan noin kahden sekunnin välein. Ohjaus toimii myös eri laitteesta, kun sivut ovat saman Vercel-projektin alla ja jaettu tallennus on määritetty.

### 1. Määritä jaettu tallennus

1. Luo Upstash Redis -tietokanta Upstashissa ja kopioi sen REST URL sekä REST token.
2. Avaa Vercel-projektin **Settings → Environment Variables**.
3. Lisää nämä muuttujat kaikkiin tarvittaviin ympäristöihin (Production ja tarvittaessa Preview):
   - `UPSTASH_REDIS_REST_URL` — Upstashin REST URL
   - `UPSTASH_REDIS_REST_TOKEN` — Upstashin REST token
   - `GRAPHICS_CONTROL_PASSWORD` — itse valitsemasi pitkä, vaikeasti arvattava salasana
4. Tallenna ja julkaise projekti uudelleen.

### 2. Avaa ohjauspaneeli

Avaa `https://OMA-PROJEKTI.vercel.app/grafiikkaohjaus.html`, syötä `GRAPHICS_CONTROL_PASSWORD` ja käytä painikkeita. Painikkeet **Näytä tulostaulu** ja **Näytä Lower Third** näyttävät valitun grafiikan ja piilottavat toisen. **Piilota kaikki** sammuttaa molemmat näkyvistä.

### 3. OBS

Pidä `index.html` ja `lowerthird.html` OBS:n selainlähteinä normaalisti. Älä lisää ohjauspaneelia OBS:n ohjelmakuvaan. Ohjauspaneeli avataan erillisessä selaimessa tai puhelimessa.

### Tärkeää

- Ilman Upstashin ympäristömuuttujia API palauttaa 503-virheen eikä etäohjaus toimi. Tämä on tarkoituksellista: Vercelin serverless-funktiossa ei ole luotettavaa pysyvää paikallista tallennusta.
- GET-näkymätila on julkisesti luettavissa, mutta sen muuttaminen vaatii ohjaussalasanan. Älä käytä salasanaa, jota käytät muualla.
- Näkyvyys päivittyy grafiikoihin yleensä kahdessa sekunnissa; tämä ei ole reaaliaikainen WebSocket-yhteys.


## Kolmas overlay: Tilastot
- `tilastot.html` — läpinäkyvä tilastografiikka samaa tyyliä kuin tulostaulu ja Lower Third.
- Ylhäällä kotijoukkueen ja vierasjoukkueen logot sekä nimet reunoilla, keskellä otsikko **Tilastot**.
- Tilastorivit: laukaukset, laukaukset kohti maalia, kulmalyönnit ja rangaistusten määrä.
- `Laukaukset` lasketaan tapahtumista `laukaus`, `laukausohi` ja `ohi`. `Laukaukset kohti maalia` lasketaan `laukaus`-tapahtumista. Rangaistusten määrä lasketaan `6min`, `10min` ja `ulosajo`-tapahtumista. TorneoPalin syöttämän tapahtumatiedon mukaan nämä ovat laskennallisia tapahtumalukuja, eivät erillinen virallinen tilastokenttä.
- Esimerkki: `https://OMA-PROJEKTI.vercel.app/tilastot.html?pvm=2026-11-25&turnaus=sjpl_2627&ottelu=23556&scale=1&refresh=5`
- Tuetut URL-parametrit: `pvm`, `turnaus`, `ottelu` (tai `match`), `scale`, `refresh`, `width` ja `api`.
