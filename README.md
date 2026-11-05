# TorneoPal Simple Scorebug + tapahtumien testipaneeli

## Sisältö
- `index.html` — Bandyliven hallinnan etusivu; oletusottelun tallennus ja suorat linkit.
- `tulostaulu.html` — läpinäkyvä tulostaulu OBS:ään (entinen `index.html`).
- `api/default-match.js` — yhteisen oletusottelun tallennus ja haku Upstash Redisistä.
- `api/live.js` — Vercel API -välityspalvelu TorneoPaliin.
- `ohjauspaneeli.html` — erillinen selaimessa toimiva testipaneeli.
- `testidata.json` — 13 historiallisen ottelun tapahtumat 7.12.2025 testitoistoa varten.

## Julkaisu
1. Kopioi kaikki tiedostot GitHub-repositorion juureen (säilytä `api/live.js` `api`-kansiossa).
2. Julkaise projekti Vercelissä.
3. OBS:n Browser Source -lähteeseen tulostauluosoite, esimerkiksi `https://OMA-PROJEKTI.vercel.app/tulostaulu.html?pvm=2026-11-25&turnaus=sjpl_2627&ottelu=23556&scale=1&refresh=5`.
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


## Pelikellon näyttö ja tapahtumien kaksoiskappaleet

Pelikello näyttää oletuksena koko ottelun kokonaispeliajan peliminuutteina: esimerkiksi `68:10` näytetään muodossa `69'`. Koodi tunnistaa automaattisesti, onko TorneoPalin kellokentässä jo koko ottelun aika vai vain käynnissä olevan jakson aika. Jos toisen jakson kellolukema on vähintään edellisten jaksojen yhteenlaskettu kesto (esimerkiksi vähintään 45:00 toisella puoliajalla), sitä käsitellään jo kokonaisaikana. Muussa tapauksessa aiempien jaksojen kesto lisätään kelloon (esimerkiksi `34:53` toisella puoliajalla muuttuu kokonaisajaksi `79:53`). Jakson pituutena käytetään syötteen `eramin`-arvoa, tai sen puuttuessa 45 minuuttia. Lisää URL-osoitteeseen `clock=seconds`, jos haluat tarkan kokonaisajan. Ohjauspaneelissa on sama valinta. Tapahtumalistassa sama tapahtuma tunnistetaan peliaikaleiman, tyypin, joukkueen ja pelaajatietojen yhdistelmästä. Jo näytettyä tapahtumaa ei lisätä uudelleen, vaikka TorneoPal palauttaisi vanhan tapahtumarivin seuraavassa livepäivityksessä.

## Verkossa käytettävät tulostauluasetukset

Ohjauspaneelin live-asetukset lisätään tulostaulun URL-osoitteeseen. Tämä toimii eri tietokoneilla ja OBS:ssä, koska asetukset ovat URL-parametreissa. Avaa `ohjauspaneeli.html`, syötä julkaistun `index.html`-tiedoston täydellinen HTTPS-osoite ja valitse asetukset. Paina **Luo live-osoite** ja **Kopioi osoite**. Liitä valmis osoite OBS:n selaimen lähteen URL-kenttään. Kun asetuksia muutetaan myöhemmin, luo uusi osoite ja päivitä OBS:n URL. Tämä versio ei tarvitse erillistä tietokantaa tai paikallista selaintallennusta.

Tuetut parametrit: `count` (1–10), `duration` (5–120 sekuntia), `width` (400–1400 px), `order=newest|oldest`, `empty=hide|message`, `showEvents=0|1`, `penalties=0|1`, `clock=minutes|seconds`, `refresh` (3–60 sekuntia), `delay` (0–300 sekuntia; oletus 0) sekä `turnaus`, `pvm`, `ottelu` ja `scale`. Jäähyt ovat oletuksena piilossa sekä aktiivisten jäähyjen alueelta että tapahtumalistasta. Lisää `penalties=1`, jos haluat näyttää ne (esim. `tulostaulu.html?ottelu=23556&penalties=1`). Vanha parametri `showPenalties=1` toimii edelleen yhteensopivuuden vuoksi. Pelikello näyttää oletuksena koko pelin kokonaisajan pyöristettynä ylöspäin seuraavaan minuuttiin (esim. `68:10` → `69'`). Lisää `clock=seconds`, jos haluat tarkan kokonaisajan muodossa `68:10`. Lisää `delay=7`, jos haluat viivästää tulostaulun näkyviä tulos-, pelikello-, tapahtuma- ja jäähypäivityksiä seitsemällä sekunnilla. Viive on oletuksena 0 sekuntia, ja suurin sallittu arvo on 300 sekuntia. Viive käsitellään selaimessa: TorneoPal-data haetaan edelleen normaalilla `refresh`-päivitysvälillä, mutta näytetään vasta viiveen jälkeen. Ohjauspaneelissa on valinta viiveelle ja se lisää `delay`-parametrin luotuun live-osoitteeseen.

## Tilastografiikka

- `tilastot.html` — oletusleveys 1200 px. Leveyttä voi muuttaa URL-parametrilla `width`, ja skaalausta parametrilla `scale`. Vaakakeskitys säilyy; pystysijaintia ja korkeussäätöjä ei muuteta.

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

Pidä `tulostaulu.html` ja `lowerthird.html` OBS:n selainlähteinä normaalisti. Älä lisää ohjauspaneelia OBS:n ohjelmakuvaan. Ohjauspaneeli avataan erillisessä selaimessa tai puhelimessa.

### Tärkeää

- Ilman Upstashin ympäristömuuttujia API palauttaa 503-virheen eikä etäohjaus toimi. Tämä on tarkoituksellista: Vercelin serverless-funktiossa ei ole luotettavaa pysyvää paikallista tallennusta.
- GET-näkymätila on julkisesti luettavissa, mutta sen muuttaminen vaatii ohjaussalasanan. Älä käytä salasanaa, jota käytät muualla.
- Näkyvyys päivittyy grafiikoihin yleensä kahdessa sekunnissa; tämä ei ole reaaliaikainen WebSocket-yhteys.


## Kolmas overlay: Tilastot
- `tilastot.html` — läpinäkyvä tilastografiikka samaa tyyliä kuin tulostaulu ja Lower Third.
- Ylhäällä kotijoukkueen ja vierasjoukkueen logot sekä nimet reunoilla, keskellä otsikko **Tilastot**.
- Tilastorivit: laukaukset, laukaukset kohti maalia, kulmalyönnit ja rangaistusten määrä.
- `Laukaukset` lasketaan tapahtumista `laukaus`, `laukausohi` ja `ohi`. `Laukaukset kohti maalia` lasketaan `laukaus`-tapahtumista. Rangaistusminuutit lasketaan `6min`-tapahtumista 6 minuuttia ja `10min`-tapahtumista 10 minuuttia tapahtumaa kohti. `ulosajo`-tapahtumaa ei lisätä minuuttisummaan, koska sen kestoa ei voi päätellä luotettavasti pelkästä tapahtumatyypistä. TorneoPalin syöttämän tapahtumatiedon mukaan nämä ovat laskennallisia tapahtumalukuja, eivät erillinen virallinen tilastokenttä.
- Esimerkki: `https://OMA-PROJEKTI.vercel.app/tilastot.html?pvm=2026-11-25&turnaus=sjpl_2627&ottelu=23556&scale=1&refresh=5`
- Tuetut URL-parametrit: `pvm`, `turnaus`, `ottelu` (tai `match`), `scale`, `refresh`, `width` ja `api`.
\n- **Ulosajot** näytetään omana tilastorivinään vain, jos ottelussa on vähintään yksi `ulosajo`-tapahtuma. Jos ulosajoja ei ole, rivi pysyy piilossa.\n
## Kokoonpanot-layout
- `kokoonpanot.html` näyttää molempien joukkueiden pelaajalistat rinnakkain samassa tummassa/keltakorosteisessa lähetysasussa.
- Näkyvyyttä ohjataan `grafiikkaohjaus.html`-sivun Näkyvyys-osiosta.
- URL-parametrit: `pvm`, `turnaus`, `ottelu` (tai `match`), `scale`, `width`, `refresh`, `api`.
- Layout yrittää lukea pelaajatiedot TorneoPalin `/api/live` XML-datasta. Jos liveupdate ei sisällä kokoonpanoja, pelaajalistat jäävät tyhjiksi eikä keksittyjä nimiä näytetä. TorneoPalin erillistä kokoonpanoendpointia ei ole tässä paketissa varmennettu.


## Bandyliven etusivu ja oletusottelu
- `index.html` on projektin uusi hallinnan etusivu. Se sisältää oletusottelun valinnan, suorat linkit grafiikoihin (Avaa/Kopioi) sekä ohjauspaneelien linkit.
- Aiempi scorebug-grafiikka säilyy tiedostossa `tulostaulu.html`. Vanhojen OBS-lähteiden osoite kannattaa päivittää `/tulostaulu.html`-osoitteeseen. Jos vanha root-URL sisältää tunnettuja grafiikkaparametreja, `index.html` ohjaa sen automaattisesti `tulostaulu.html`-sivulle.
- `api/default-match.js` tallentaa oletusottelun avaimella `torneopal:graphics:default-match` Upstash Redisissä. Käyttää samoja ympäristömuuttujia kuin grafiikoiden etäohjaus: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `GRAPHICS_CONTROL_PASSWORD`.
- Etusivulla tallentaminen vaatii ohjaussalasanan. Grafiikat ilman URL:ssa annettua ottelun ID:tä lukevat oletusottelun tallennuksesta. URL:n oma `ottelu`/`match`-parametri ohittaa oletusvalinnan.


## Sarjataulukko-grafiikka

- Avaa `sarjataulukko.html` OBS:n Browser Source -lähteenä.
- Oletuslähde: Miesten Bandyliiga (`turnaus=sjpl_2627`, `sarja=MBL`).
- Grafiikka hakee sarjasivun palvelinreitin `/api/standings` kautta ja päivittää tiedot oletuksena 30 sekunnin välein.
- `view=runkosarja` näyttää runkosarjan, `view=ylempi` ylemmän jatkosarjan ja `view=alempi` alemman jatkosarjan. Esimerkiksi `sarjataulukko.html?turnaus=sjpl_2526&sarja=MBL&view=ylempi&refresh=30`.
- Etusivulla on nyt erilliset Avaa/Kopioi-linkit runkosarjalle sekä ylemmälle ja alemmalle jatkosarjalle.
- Parametrit: `turnaus`, `sarja`, `view`, `refresh` (5–300 sekuntia), `width` (grafiikan leveys) ja `scale` (prosentteina).
- Debug-tiedot: lisää osoitteeseen `&debug=1`. Debug näyttää kaikkien HTML-taulukoiden tunnistuksen ja joukkue-rivien määrän.
- Jatkosarjanäkymästä näytetään ystävällinen ilmoitus, jos kyseisen kauden sivulla ei vielä ole jatkosarjan taulukkoa.
- Tilastoarvot luetaan rivin kuudesta viimeisestä ei-tyhjästä arvosta järjestyksessä ottelut, voitot, tasapelit, tappiot, maalit ja pisteet. Maaliero lasketaan maalit-arvosta; nolla näytetään nollana.


## Sarjataulukon näkymävalinta FIX06
- Sarjasivun useat taulukot tunnistetaan otsikoiden `Runkosarja`, `Ylempi jatkosarja` ja `Alempi jatkosarja` perusteella. Jos TorneoPal ei anna tunnistettavaa otsikkoa, käytetään taulukoiden joukkue-rivien määrää ja järjestystä varatunnistuksena.
- Jatkosarjan näkymät toimivat viime kauden sivulla, jossa ne ovat olemassa; tällä kaudella sivu voi ilmoittaa, ettei jatkosarjaa vielä ole julkaistu.

Tulostaulun sijainti: offset X 40 px ja offset Y 30 px. Siirtymät ovat kiinteitä pikseleitä eivätkä muutu `scale`-parametrin mukana.

## Päivän ottelut -grafiikka

- `paivanottelut.html` näyttää saman päivän valitut ottelut tumma/keltainen Bandylive-tyylillä. Jokaisessa ottelussa näytetään joukkueiden nimet ja logot, tulos, ottelun tila/käynnissä oleva peliminuutti sekä maalintekijät joukkueittain.
- Maalintekijät poimitaan ottelun `maali`-tapahtumista. Pelaajan nimi näytetään peliminuutin kanssa, esimerkiksi `Matti Möttönen 67'`. Maalintekijän minuuttiin käytetään ensisijaisesti TorneoPalin kumulatiivista `kulunutaika`-arvoa; jos se puuttuu, aika lasketaan tapahtuman jakson ja `aika`-kentän perusteella.
- Oletuksena näytetään kaikki valitun päivän ottelut. Ottelut voidaan rajata ID-tunnuksilla, jolloin ne näytetään annetussa järjestyksessä.
- Esimerkki kaikista päivän otteluista: `https://OMA-PROJEKTI.vercel.app/paivanottelut.html?pvm=2026-11-01&turnaus=sjpl_2627&refresh=5`.
- Esimerkki valituista otteluista: `https://OMA-PROJEKTI.vercel.app/paivanottelut.html?pvm=2026-11-01&turnaus=sjpl_2627&ottelut=24471,24472,24473`.
- Voit myös toistaa saman parametrin: `...?ottelu=24471&ottelu=24472&ottelu=24473`.
- Parametrit: `pvm`, `turnaus`, `ottelut` (pilkuilla tai puolipisteillä erotetut ID:t), toistettava `ottelu`/`match`, `refresh` (3–60 sekuntia, oletus 5), `delay` (0–300 sekuntia, oletus 0), `width` (600–1600 px, oletus 1050), `scale` (0.5–2.5) ja `api` (valinnainen vaihtoehtoinen XML-osoite).
- Ennen ottelun alkua tuloksen paikalla näytetään ottelun ohjelmaan merkitty alkamisaika (HH:MM), jos TorneoPalin ottelutiedoissa on alkamisaikakenttä. Ottelun alettua keskellä näytetään tulos normaalisti.
- Etusivulla on Päivän ottelut -grafiikan linkki ja vapaaehtoinen kenttä, johon voi syöttää useita ottelu-ID-tunnuksia pilkuilla erotettuna. Kentän jättäminen tyhjäksi näyttää kaikki kyseisen päivän ottelut.


FIX21: Päivän ottelut hakee tulevien otteluiden aloitusajan ottelukohtaiselta TorneoPal HTML-sivulta (`ottelu.php?ottelu=...`) uuden `/api/match-start`-Vercel-reitin kautta. Reitti poimii `Klo`-rivin kellonajan. Ottelun käynnistyttyä tulosnäyttö jatkuu ennallaan.


FIX22: ottelun alkamisaika poimitaan Klo-riviltä joustavammalla HTML-jäsennyksellä. API palauttaa lisäksi debug-tiedot (HTTP-tila, löytyikö Klo-otsikko ja poimitun tekstin esikatselu), jotta mahdolliset lähdesivun muutokset voidaan diagnosoida.

### FIX24 – päivän otteluiden alkamisajat otteluohjelmasta

Alkamisajat haetaan nyt suoraan Finbandyn sarjaohjelmasta (`sarja.php?...&ottelut=1`).
Ottelu yhdistetään päivän live-XML:ään päivämäärän sekä koti- ja vierasjoukkueen nimien perusteella. Tämä on tarpeen, koska live-XML:n `otteluid` ei vastaa sarjaohjelman `ottelu`-linkin tunnistetta. Kellonaika luetaan sarjaohjelman `.ml_tulosklo`-kentästä.

FIX25: Päivän otteluiden kellonaikahaun debug-vastausta laajennettu. Jos otteluohjelmasta ei löydy rivejä, `/api/match-start` palauttaa nyt myös HTTP-tilakoodin, lopullisen URL:n, HTML:n pituuden, sivun otsikon sekä tiedon siitä, löytyivätkö ottelulista ja kellonaikaluokka. Näillä tiedoilla voidaan erottaa palvelimen estämä/tyhjä vastaus varsinaisesta HTML-jäsennysongelmasta.


## Jääpallon otteluennakko ja kauden pelaajatilastot
- `otteluennakko.html` — tulostettava A4-otteluennakko: kokoonpanot, joukkueiden kauden pelaajatilastot, sarjataulukko ja päivän muut ottelut.
- `api/team-stats.js` — hakee joukkueen kausitilastot Finbandy/TorneoPalin joukkuesivulta.

Otteluennakon avaaminen: `otteluennakko.html?ottelu=OTTELUN_ID` (päivämäärä voidaan antaa parametrilla `pvm=VVVV-KK-PP`). Vanhojen linkkien yhteensopivuuden vuoksi myös parametrit `match` ja `date` toimivat. Otteluennakko käyttää projektin olemassa olevia `/api/match`, `/api/standings` ja `/api/live` -reittejä sekä uutta `/api/team-stats`-reittiä.


## Otteluennakon sarjataulukko ja menneet ottelut FIX34
- Otteluennakon sarjataulukko luetaan nyt suoraan haetun ottelun TorneoPal-sivun HTML:stä; erillistä kiinteään sarjaan kohdistuvaa sarjataulukkohakua ei käytetä tässä näkymässä.
- Otteluennakon alareunassa näytetään kummankin joukkueen joukkuesivulta viisi viimeisintä ennen ottelupäivää pelattua ottelua.
- Menneiden otteluiden rivit tunnistetaan joukkuesivun pelatuista otteluista (`li.match.played`) ja niistä näytetään päivämäärä, ottelu ja tulos. Ottelun nimeä painamalla avautuu TorneoPalin ottelusivu.
- Ottelut, joista joukkuesivulla ei ole tulosta tai joita ei ole merkitty pelatuiksi, jätetään pois.


### Ottelukohtainen sarjataulukko

Uusi `sarjataulukko_ottelu.html` hakee sarjataulukon valitun ottelun TorneoPal-sivulta `/api/match`-reitin kautta. Avaa esimerkiksi `sarjataulukko_ottelu.html?ottelu=24472`. Ohjauspaneelin Ottelun sarjataulukko -linkki käyttää valittua ottelun ID:tä. Alkuperäinen `sarjataulukko.html` ja sen sarjakohtainen `/api/standings`-haku säilyvät ennallaan.
