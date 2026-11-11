# Pelaajarekisterin automaattinen päivitys

Pelaajarekisteri päivittyy GitHub Actionsilla kerran vuorokaudessa. Sivuston kävijät lukevat edelleen vain staattista `pelaajarekisteri.json`-tiedostoa; selain ei tee pyyntöjä Bandyliigan palvelimelle.

## Tiedostot

- `.github/workflows/update-player-registry.yml` – päivittäinen ajastus ja manuaalinen käynnistys.
- `scripts/update_player_registry.py` – hakee SportsPressin pelaajalistan ja muodostaa kevyen JSON-rekisterin.
- `pelaajarekisteri.json` – sivuston käyttämä valmis rekisteri.

## Päivityksen kuormitusrajat

- Ajo kerran vuorokaudessa, lisäksi manuaalinen käynnistys GitHub Actionsista.
- Yksi HTTP-pyyntö kerrallaan.
- 1,5 sekunnin tauko sivupyyntöjen välissä.
- Enintään 400 sivupyyntöä yhden ajon aikana.
- Ei automaattisia uusintayrityksiä virhetilanteissa.
- HTTP 429/503 tai muu virhe keskeyttää päivityksen.
- Vajaaksi jäänyt haku ei korvaa nykyistä JSON-tiedostoa.
- Rekisteri korvataan vasta, kun kaikki sivut on saatu ja pelaajamäärän tarkistukset läpäisty.
- Päällekkäiset päivitysajot estetään GitHub Actionsin concurrency-asetuksella.

Rajapinta palauttaa tällä hetkellä 10 tietuetta sivua kohden. Nykyisellä 3 622 tietueen määrällä päivitys tarvitsee noin 363 sivupyyntöä ja kestää noin yhdeksän minuuttia. Pyyntötahti on tarkoituksella hidas.

## Käyttöönotto

1. Pura ZIP ja kopioi `bandyliveedit`-kansion SISÄLTÖ GitHub-repositorion juureen. Älä jätä tiedostoja ylimääräisen `bandyliveedit`-alikansion sisään.
2. Varmista, että GitHub-repositoriossa näkyvät nämä polut:
   - `.github/workflows/update-player-registry.yml`
   - `scripts/update_player_registry.py`
   - `pelaajarekisteri.json`
3. Avaa GitHubissa **Actions**. Jos Actions ei ole käytössä, ota se käyttöön repositorion asetuksista.
4. Valitse työnkulku **Päivitä Bandyliigan pelaajarekisteri** ja paina **Run workflow** ensimmäistä testiajoa varten.
5. Tarkista ajon lokista, että haku päättyy onnistuneesti ja että commit päivittyneestä `pelaajarekisteri.json`-tiedostosta syntyy.
6. Tämän jälkeen työnkulku käynnistyy automaattisesti kerran vuorokaudessa.

GitHub Actionsin `GITHUB_TOKEN` tarvitsee sisällön kirjoitusoikeuden. Työnkulku pyytää sen `permissions: contents: write` -asetuksella. Jos organisaation/repositorion käytännöt estävät tämän, muuta **Settings → Actions → General → Workflow permissions** sallimaan kirjoitusoikeus.

Kun GitHubiin syntyy uusi commit, nykyinen GitHub Pages- tai Vercel-julkaisuketju voi julkaista päivitetyn JSON-tiedoston normaalisti.

## Turvallinen testaus ilman verkkopyyntöjä

Skriptin muunnoksen voi testata paikallisella täydellä SportsPress-JSON-tiedostolla:

```bash
python scripts/update_player_registry.py --input-file bandyliiga-kaikki-pelaajat.json --output /tmp/pelaajarekisteri-test.json
```

Tämä testitapa ei tee yhtään verkkopyyntöä eikä muuta tuotannon `pelaajarekisteri.json`-tiedostoa.
