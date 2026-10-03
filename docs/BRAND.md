# Brand breakdown

Extracted from `Erik_PortFolio_2025.pdf` (48 pages, Illustrator export) and the 2026 CV. Colours were sampled from the rendered cover; fonts were read from the PDF's embedded font list.

## Identity

| Element | In the PDF | On the site |
| --- | --- | --- |
| Logo / lockup | Wide italic "PORT / FOLIO" with "Erik Prayoga" in orange script across it, two pill tags above: "BERKARYA" and "UNTUK BERCANDA" | Rebuilt in live type as the home hero (H1). Same structure, animates in. |
| Wordmark | None as such | "ERIK" (display) + "Prayoga" (script). Used in the header and admin. |
| Mascot | Illustrated self-portrait: blue hair, round glasses, wink, pink/yellow shirt, white sticker outline | Background removed and re-used in the hero, About page and contact CTA. The "Halo!" script was stripped from the art and re-set as live text so it can animate. |
| Motto | "Berkarya untuk Bercanda" | Ribbon tags, manifesto section, loader, mobile menu. |
| Favicon | n/a | `src/app/icon.svg`: chamfered cobalt tile with an orange slash and "EP". |

## Colour

| Token | Hex | Source | Rule |
| --- | --- | --- | --- |
| `--cobalt` | `#0039C1` | Cover "PORTFOLIO", headings, buttons | Structure: primary buttons, headings, slabs. |
| `--cobalt-deep` | `#1B3BB8` | Gradient end on the cover | Secondary blue. |
| `--orange` | `#F27600` | Script name, tags, underline bar | Highlight only: fills, tags, hover. Never small text on light backgrounds (2.5:1). |
| `--orange-text` | `#D45F00` | Derived | Orange for large text on paper (3.4:1, AA large). |
| `--peach` | `#FF9E83` | Avatar skin tone | Soft accent, rarely used. |
| `--paper` | `#EEF2FF` | Page background of every PDF page | Light-mode background. |
| `--ink` | `#141A33` | Darkened from the PDF navy `#1D2847` | Body text. |

Dark mode ("proxy mode") swaps paper for `#0A0E1F`, lifts cobalt text to `#8AA4FF` for contrast, and keeps orange. It follows the visitor's system setting, with a toggle in the header.

## Typography

| Role | In the PDF | On the site | Why |
| --- | --- | --- | --- |
| Display | Creato Display Black Italic | Archivo variable, weight 900, italic, width 125% | Free, self-hosted, and its width axis gets the same wide, heavy italic shape. Also the closest match to the ZZZ site's chunky type. |
| Script | Blank Script, Against History | Caveat Bold | Both PDF scripts are commercial fonts. Caveat has a similar marker feel and is OFL. |
| Body | Roboto, Gotham | Archivo at normal width | One family for display and body keeps it coherent. |
| UI labels | n/a | JetBrains Mono 500 | Small "interface" labels in the ZZZ spirit. |

If Erik owns web licences for Creato Display or Blank Script, drop the woff2 files into `src/fonts/` and point the `localFont` calls in `src/app/layout.tsx` at them. Every component reads the CSS variables, so nothing else changes.

## Shape and texture

- Interactive elements and cards are **chamfered** (two clipped corners, `.chamfer` / `.chamfer-lg`), borrowed from the ZZZ UI. Form inputs stay square because a clip-path would hide their focus ring.
- **Halftone dots** on cobalt surfaces, **diagonal slab** behind the hero avatar, **cobalt/orange caution stripes** once, above the footer.
- A fixed film-grain overlay at 5% opacity.

## Voice

Erik's PDF voice is friendly, a bit goofy, English with Bahasa sprinkled in ("Halo!", "Terima kasih!", "Berkarya untuk Bercanda"). The copy keeps that, but was run through a humanizer pass: cut "thrilled", "live and breathe", "embark on this journey", "where imagination and fun collide", em dashes and stacked adjectives. Case write-ups are first person, two short paragraphs, and only state facts from the PDF or CV. Years and regions are left blank where the source doesn't say.
