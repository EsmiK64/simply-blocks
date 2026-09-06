---
description: Wait for CI checks after every PR push and fix failures before considering work done
---

# PR CI Gate

Tento skill se spouští **vždy** když se otevírá PR nebo se do něj pushují změny.
Nikdy neoznačuj práci za hotovou, dokud CI kontroly neprojdou.

## Postup

1. **Po pushu do PR větve** okamžitě spusť:

```bash
gh pr checks <PR_NUMBER> 2>&1
```

2. **Čekej na dokončení** — CI joby mohou běžet i několik minut. Opakovaně
   kontroluj stav (cca každých 30-60s) dokud všechny joby nejsou `pass` nebo `fail`:

```bash
gh pr checks <PR_NUMBER> --watch 2>&1
```

3. **Pokud nějaký job selže**, stáhni logy a oprav příčinu:

```bash
gh run view <RUN_ID> --log-failed 2>&1
```

4. **Oprav lokálně**, commitni, pushni a vrať se ke kroku 1.

5. **Až všechny kontroly projdou**, teprve pak informuj uživatele že je hotovo.

## Co kontrolovat

Typické CI kontroly v tomto repu:

- `Formát a PHP lint` — Prettier `format:check` + `php -l` na všech `.php` souborech
- `Smoke testy` — Cypress E2E (SEO hlavička, tel:/mailto:, axe, 320px)
- `Lighthouse` — SEO 100, přístupnost >= 95, best practices >= 95, výkon >= 90
- `CMS core testy` — PHPUnit nad `packages/cms`

## Časté selhání a rychlé opravy

- **Prettier fail** -> `bunx prettier --write <file>` a commitni
- **PHP lint fail** -> syntax error v `.php` souboru, oprav a commitni
- **Cypress fail** -> spusť lokálně (viz AGENTS.md kapitola 8), oprav selektor/obsah
- **Lighthouse fail** -> zkontroluj prahy v `lighthouserc`, oprav web ne prahy
- **axe a11y fail** -> zkontroluj `role`, `aria-*`, `tabindex` na problematickych elementech

## Pravidlo

**Nikdy neuzavírej PR ani neoznačuj práci za hotovou bez zelených CI kontrol.**
