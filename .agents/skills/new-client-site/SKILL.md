---
name: new-client-site
description: Založení nového klientského webu v tomto multirepu — od vyjasnění zadání (brief od agentury + volitelné zrcadlení starého webu) přes grill-with-docs (grilling + domain-modeling, tvoří ADR a glosář), vygenerování projektu z kostry, až po SEO základ, testy, náhled pro klienta a deploy workflow. Use when starting a new client website, adding a project to clients/, or doing a large redesign.
---

Postup pro nový klientský web (nebo velký redesign) v `clients/`.
Pravidla, která nesmíš porušit, jsou v [`AGENTS.md`](../../../AGENTS.md).

## 1. Vyjasnit zadání (povinné)

### 1.0 Přípravné podklady (před grillem)

Než začneš grilovat, seber vše, co už existuje, ať pokládáš lepší otázky na
reálných datech, ne naslepo.

#### a) Brief od agentury (často startuje zadání)

Skill často startuje z briefu, který předá Mescon digital. Typický formát:

```
MESCON - nové zadání webu

jmeno_prijmeni: Vávra, Vlastimil
nazev_firmy: Flexi-Závoz s.r.o
email: vlastimil@autodopravavavra.cz
telefon: 420602440558
obor: Auto doprava flotily rozvoz jídel pro Bolt a Bolt taxi
cilova_skupina: Firmy a podnikatelé.
cil_navstevnika: Zavolat a udělat poptávku
typ_webu: One-page
struktura_webu: Úvod, O nás, Služby a Kontakt.
sluzby_produkty: Auto doprava
kontaktni_udaje_web: Tel. A e-mail
webova_domena: Doménu ještě nemám a potřebuji ji navrhnout.
styl_webu: Jednoduchý, čistý a přehledný web.
barvy: Žluto černá
inspirace: Nemám konkrétní vzor, návrh nechám na MESCON.
dostupne_podklady: Nemám žádné hotové podklady a potřebuji je připravit.
dalsi_funkce: Ne, nepotřebuji žádné speciální funkce.
cokoli_dalsiho: Ne, to je vše.
souhlas_zpracovani: Ano
```

Pokud brief dostaneš, použij ho jako vstup do grilování — **neopakuj otázky,
na které máš odpověď**. Grilluj jen otevřené větve (doména, vizuální směr,
typografie, chybějící podklady, IČO/sídlo z ARES, měřicí kód, přístupy do
GSC/Bing). Pokud brief chybí, grilluj vše od vizuálu po technologii.

#### b) Stažení existujícího webu klienta (volitelné, jen při redesignu)

Pokud klient už web má a děláme redesign, zrcadli ho jako referenci **před
grillem**, ať pokládáš lepší otázky na reálném obsahu. Není to vždy — někdy
klient web nemá a stavíme od nuly.

```bash
# Do _old-site/ nebo clients/<klient>/.reference/ (mimo repo, v .gitignore)
wget --mirror --convert-links --adjust-extension --page-requisites \
     --no-parent --restrict-file-names=windows \
     -e robots=off -P ./_old-site/ https://stary-web.klient.cz/
```

Počítat s:

- **Velikost a videa** — `--mirror` stáhne vše včetně videí/PDF v plném
  rozlišení (stovky MB až GB). Pro referenci často stačí
  `-A html,css,js,png,jpg,webp,mp4` nebo vyloučit `-R pdf,zip`. Těžká videa
  stáhnout cíleně ručně, případně se zeptat klienta na originály (může je
  mít uložené v plné kvalitě a stačí odkaz).
- **Autorská práva** — znovupoužití obsahu/obrázků/videí potvrdit s klientem
  (licence). `AGENTS.md` kap. 5 zakazuje neověřená tvrzení, to platí i pro
  převzaté assety.
- **Kam** — nikdy do `clients/<klient>/` (tam patří jen nový projekt) ani do
  repa. Jen jako podklad pro grill a stavbu, ne jako součást dodávky.
- **Účel** — starý web je reference pro obsah/strukturu/kontakty, **ne** pro
  překopírování designu. `AGENTS.md` kap. 2 vyžaduje originální styl.

### 1.1 Grilování (grill-with-docs)

Použij skill [`grill-with-docs`](../../../../.agents/skills/grill-with-docs/SKILL.md),
který zároveň volá [`grilling`](../../../../.agents/skills/grilling/SKILL.md)
(relentless interview po větvích rozhodovacího stromu — jedna otázka v jednu
chvíli, 2–4 konkrétní možnosti, u každé i tvoje doporučení) a
[`domain-modeling`](../../../../.agents/skills/domain-modeling/SKILL.md)
(tvoří `CONTEXT.md` glosář a ADR záznamy průběžně, jak se rozhodnutí rýsují).
Nezačínej kódit dřív, než je vyřešená každá větev rozhodovacího stromu.

> `grill-with-docs` má `disable-model-invocation: true`, takže ho nevoláš přes
> Skill tool přímo — místo toho ručně aplikuj oba dílčí skilly (`grilling` +
> `domain-modeling`) dohromady: pokládej otázky po větvích a průběžně zapisuj
> glosář a ADR do `clients/<klient>/CONTEXT.md` a `clients/<klient>/docs/adr/`.

Minimálně musí být jasné:

- vizuální směr a nálada (a čemu se naopak vyhnout);
- typografie (display + textové písmo, nikdy generické Roboto/Open Sans/Inter);
- barevná paleta a kontrast;
- cíl návštěvníka a hlavní konverze (telefon, formulář, objednávka);
- struktura sekcí a jejich obsah;
- dostupné podklady (texty, fotky, logo, IČO, sídlo, otevírací doba);
- doména (nebo návrh variant) a cílová subdoména na hostingu;
- technologie: čisté HTML/CSS/JS × Next.js × PHP + čistý frontend × **Grav CMS**.

Co lze zjistit z repa (konvence, existující projekty, deploy), zjisti sám a
neptej se na to.

## 2. Založit projekt

Pro **statický web** (one-page, bez editace klientem):

```bash
cp -r templates/static-site clients/<klient>
```

Pro **Grav CMS** (klient chce sám editovat obsah):

```bash
cp -r templates/grav-site clients/<klient>
# Přejmenuj user/themes/klient → user/themes/<klient>
# V user/config/system.yaml změň pages.theme na <klient>
# V user/themes/<klient>/klient.php přejmenuj třídu Klient → <Klient>
```

Název složky: krátký, malými písmeny, bez diakritiky, s pomlčkami (`flexi-zavoz`).
Pro Next.js nebo PHP projekt použij vlastní strukturu, ale zachovej stejné
požadavky na SEO, přístupnost a testovatelnost (statický výstup nebo popsaný build).

### 2.1 Složka `calls/` — záznamy hovorů s klientem

Po založení projektu vytvoř `clients/<klient>/calls/` s `README.md`:

```bash
mkdir -p clients/<klient>/calls
```

Konvence názvů souborů:

```
YYYY-MM-DD-<krátký-popis>.md
```

Příklad: `2026-08-25-moravkova-call.md`

- Datum ISO formát pro přirozené řazení.
- Krátký popis — kdo volal nebo o čem šlo (`moravkova-call`, `brief-schuzka`,
  `pripominky-v1`).
- Obsah volná forma — důležitá rozhodnutí, poznámky, otevřené otázky.

Sem patří všechny poznámky z hovorů a schůzek s klientem — drží kontext
rozhodnutí u projektu, ať se k nim dá kdykoli vrátit.

> **Grav vs. statický web?** Grav jen pro nové weby, kde klient chce sám editovat
> obsah. Pro one-page weby bez editace zůstává `templates/static-site`. Grav jádro
> není v repu — instaluje se přes `scripts/grav-bootstrap.sh`. Viz
> [`templates/grav-site/README.md`](../../../templates/grav-site/README.md).

## 3. Postavit web

- Originální layout a typografie — žádný „hero + tři karty“ ze šablony.
- Plná česká diakritika, texty psát věcně, bez neověřených tvrzení a čísel.
- Hlavní CTA v navigaci, v obsahu i jako fixní prvek na mobilu.
- Přístupnost: skip link, viditelný focus, kontrast WCAG AA, ovládání klávesnicí,
  `prefers-reduced-motion`, funkční layout od 320 px.
- SEO checklist z `AGENTS.md` (title, description, canonical, OG/Twitter, JSON-LD,
  `robots.txt`, `sitemap.xml`, sémantické HTML, alt texty, rychlost).
- Povinné z firemního standardu ([kapitola 9](../../../AGENTS.md#9-firemní-standard-jedenáctero-mescon-digital)):
  údaje firmy z ARES v patičce i JSON-LD, cookie lišta v Consent Mode v2, stránka
  zásad ochrany osobních údajů, vlastní `404.html`, `.htaccess` s HTTPS a
  bezpečnostními hlavičkami, kompletní sada ikon a `site.webmanifest`.
  Kostra tyto soubory obsahuje jako placeholdery — nikdy je nesmaž, vyplň je.

## 4. Ověřit

**Statický web:**

```bash
bun install
cd shared && composer install && cd -     # Plates (jednorázově)
bun run preview -- <klient>              # http://localhost:8000
PROJECT=<klient> bunx cypress run --e2e --headless     # SEO, konverzní odkazy, axe, 320 px
bun run format:check
```

**Grav CMS:**

```bash
# CI (quality-grav.yml) spustí automaticky: stáhne Grav jádro, nainstaluje pluginy,
# nasymlinkuje téma, spustí php -S a jedou Cypress (grav-site.cy.mjs) + Lighthouse.
# Lokálně lze otestovat ručně (vyžaduje stažené Grav jádro v /tmp/grav-core):
PORT=4399 PROJECT=<klient> bunx cypress run --e2e --headless \
  --spec cypress/e2e/grav-site.cy.mjs --config baseUrl=http://127.0.0.1:4399
bun run format:check
```

Vizuálně projdi desktop i mobil (včetně 320 px) a hlavní interakce.
Smoke testy hlídají i firemní standard: ikony, manifest, `og:image`, identifikaci
firmy v patičce, vlastní 404, hlavičky v `.htaccess`, výchozí `denied` u cookie
lišty a stránku zásad ochrany osobních údajů.

## 5. Deploy a náhled pro klienta

**Statický web i Grav CMS** — sjednocený deploy přes SFTP (lftp):

1. Přidej `clients/<klient>/README.md`: doména, kontakty, chybějící podklady.
2. Přidej řádek do [`sites.yaml`](../../../sites.yaml): `<klient>: <volné-číslo-subdomény>`.
3. Otevři PR — CI spustí kontroly kvality (Cypress + Lighthouse).
4. Po mergi do `main` se projekt automaticky nasadí přes SFTP na
   `<N>.mescontvorba.cz` (auto-discovery v [`deploy.yml`](../../../.github/workflows/deploy.yml)).
5. Odkaz na náhled pošli klientovi ke schválení. Připomínky řeš dalšími commity
   do stejného PR a po mergu se nasadí znovu.
6. Každá další změna během života webu jde stejným cyklem: PR → merge → SFTP deploy.

**Grav CMS — jednorázový bootstrap (jen při zakládání):**

1. Spusť `scripts/grav-bootstrap.sh <klient> 1.7.53 <site-number> <sftp-host> <sftp-user>`
   z rootu repa (příprava lokálně + SFTP upload jádra, pluginů, content-seed, admin účtu).
2. Nastav cron na serveru pro `bin/grav clearcache` (např. každou hodinu) —
   SFTP neumí spouštět CLI příkazy, takže cache se čistí cronem, ne po deploy.
3. Produkční nasazení je manuální — číslované subdomény jsou osobní preview/staging.

## 6. Co po sobě zanechat

- README projektu s aktuálním stavem a seznamem chybějících podkladů;
- popis vizuálního směru (písma, barvy, motiv), aby na něj šlo navázat;
- záznamy hovorů s klientem v `calls/` (viz [2.1](#21-složka-calls--záznamy-hovorů-s-klientem));
- otevřené otázky na klienta v popisu PR;
- vyplněný checklist 11 bodů v PR a explicitní TODO u toho, co potřebuje přístupy
  (ID měřicího kódu, GSC/Bing/IndexNow) nebo schválení (seniorní review, akceptace).
  Tyhle údaje si nikdy nevymýšlej.
