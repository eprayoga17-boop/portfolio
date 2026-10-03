# Customer journey and motion plan

## Who visits, and what they need

| Visitor | Arrives from | Wants | Leaves with |
| --- | --- | --- | --- |
| Recruiter / HR | Job application, LinkedIn, the CV link | Proof of level in under a minute, then the CV | CV download or WhatsApp |
| Brand owner / marketing lead | Instagram, referral | "Has he done my kind of brand?" | Contact form or WhatsApp |
| Agency creative director | Referral | Range and craft | Case pages, then contact |

The CV currently points to a Google Drive folder. This site replaces that link.

## Site map

```
/                 Home: hero, client marquee, manifesto, featured cases, numbers, industries, CTA
/work             All client work, filterable by industry (?c=clinic|beauty|fnb|service)
/work/[slug]      Case study: summary, facts, cover, what I did, gallery, next case
/about            Bio, career timeline, toolbox, CV download
/side-quests      Personal projects and competitions, trophy shelf
/contact          Form + direct channels
/privacy          UU PDP notice
/admin/*          CMS (login, MFA, projects, images, inquiries, audit log)
```

## Paths

**Recruiter, about 60 seconds:** Home hero (role, years, countries in 16 words) → "See work" → two case studies → About (timeline, Download CV) → WhatsApp. The numbers section on Home answers "how senior?" without a click.

**Client:** Home → "Find your industry" (four doors, pre-filtered) → `/work?c=beauty` → a case → "Next case" keeps them browsing in the same lane → "Let's talk". The contact form asks what it's about (full-time, freelance, branding, social) so Erik can triage.

One label per intent across the site: "See work" (portfolio), "Let's talk" (contact), "Download CV".

## Why it isn't a full-page snap scroller like ZZZ

The ZZZ site snaps whole screens on every wheel tick. That works for a game teaser with five big scenes. For a portfolio with 28 case studies it would fight trackpads, break deep links, hide content from search, and make recruiters work to skim. So the ZZZ feel comes from the moments, not the scroll mechanics:

| ZZZ device | Here | Purpose |
| --- | --- | --- |
| Boot / loading screen | "Tuning in" counter with ribbon tags, diagonal panels wipe out. First visit per session only. | Sets the tone once, never again. |
| Hard diagonal cuts between scenes | Cobalt + orange slash on every route change | Makes navigation feel like changing channels. |
| Agent select (big name, art in a slanted frame, roster underneath) | "Pick a brand" featured-case selector, keyboard and swipe | The signature moment: featured work as characters. |
| Chunky italic type, halftone, chamfered UI | Display type, halftone slabs, chamfered buttons and cards | Visual language. |
| Pinned scenes | Manifesto pins while words light up; About timeline pans sideways | Pacing: read the motto, travel the career. |

Smooth scrolling is Lenis, driven from GSAP's ticker so ScrollTrigger stays in sync. Everything runs inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`; with reduced motion the loader, curtain, pinning and smoothing are all skipped and content is simply visible. If the JS bundle fails to load within 4 seconds, the inline boot script unhides everything.
