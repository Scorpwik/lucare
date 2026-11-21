# LuCare — Responsive + Depth Redesign Spec (v1, 2026-11-20)

## Research takeaways
- **Samsung Health 2026 / One UI 8.5**: modular dashboard, widgets resizable (S/M/L), top category bar. Critique: colour without meaning → keep a *semantic* domain palette (existing domain chips), not decoration.
- **Oura (Instrument redesign)**: progressive disclosure in 3 levels — glanceable ring/number → focused metric with short trend → exploratory detail. "One big thing" hero on Today.
- **Whoop / Oura / Garmin web dashboards**: large screens show the same cards but with trend charts, timelines and secondary stats inline instead of behind taps.
- **Linear / Vercel**: thin 1px borders + subtle inner highlight, dense but calm type, generous gutters, sticky context header.
- **Nothing OS widgets**: dot-matrix numerals for hero figures, monochrome surfaces + one accent, rounded modular tiles.
- **Layout best practice**: page grid via media queries; card internals via **container queries** (`container-type: inline-size`) so a tile adapts to its own span. Use `minmax(0,1fr)` tracks + `min-width:0` on tiles. Spans only inside breakpoints with enough columns. Don't stretch forever: cap the container (we cap at 1760px since dashboards are data-dense; text blocks keep ≤ 70ch). Fluid type with `clamp()`.

## Container & gutters
| Breakpoint | Width | Grid cols (Hoy) | Gutter (page pad) | Gap | Sidebar |
|---|---|---|---|---|---|
| Mobile | <640 | 1 (2 for small stat tiles) | 16px | 12px | bottom tab bar |
| Tablet | 640–1023 | 2 | 24px | 16px | bottom tab bar |
| Laptop | 1024–1279 | 4 | 28px | 16px | rail 240px |
| Desktop | 1280–1535 | 6 | 32px | 20px | 260px |
| Desktop L | 1536–1919 | 6 | 40px | 20px | 280px |
| 1920+ | 1920–2559 | 12 | 48px | 24px | 288px |
| Ultrawide | ≥2560 | 12, container max 1760px centred (+ scaled type) | 56px | 28px | 300px |

Root type scales slightly: `html{font-size:clamp(15px, 0.55vw + 9px, 19px)}` above 1536 so 2560 isn't tiny.

## Fluid type
- Display (hero numbers, dot font): `clamp(2.25rem, 1.2rem + 2.4vw, 4.5rem)`
- H1 page title: `clamp(1.6rem, 1rem + 1.4vw, 2.75rem)`
- Card title: `clamp(0.95rem, 0.85rem + 0.25vw, 1.15rem)`
- Body: 1rem; meta: 0.8125rem (never < 12px)

## Hoy widget spans (cols of 12 at ≥1920; 6 at 1280–1919; 4 at 1024; 2 at tablet)
| Widget | 12-col | 6-col | 4-col | 2-col | Rows | Large-screen extras |
|---|---|---|---|---|---|---|
| saludo (hero) | 8 | 4 | 4 | 2 | 1 | date, weather-free summary: # events, # deberes due, meds pending |
| ia_insight | 4 | 2 | 4 | 2 | 1 | gradient-border "AI" card, 2–3 bullet insights |
| agenda | 7 | 4 | 4 | 2 | 2 | timeline today + next 3 days; time range, duration, location, description snippet, source chip, calendar colour bar |
| tareas | 5 | 2 | 4 | 2 | 2 | due date (relative + absolute), materia, estado chip, overdue highlight, progress bar done/total |
| pastillas | 4 | 2 | 2 | 1 | 1 | taken/total ring, next dose time |
| citas | 4 | 2 | 2 | 1 | 1 | next cita countdown, place |
| rutina_am | 4 | 2 | 2 | 1 | 1 | step checklist + progress |
| bloqueador | 3 | 2 | 2 | 1 | 1 | UV/reapply timer |
| gimnasio | 3 | 2 | 2 | 1 | 1 | next session, weekly volume mini bars |
| cuerpo_resumen | 3 | 2 | 2 | 1 | 1 | weight/BF + sparkline |
| sueno | 3 | 2 | 2 | 1 | 1 | hours + 7-day bars |
| habitos_racha | 4 | 3 | 2 | 2 | 1 | streak dot-matrix + 7-day heatmap |
| animo | 4 | 3 | 2 | 1 | 1 | 7-day mood dots |
| cuidado_personal | 4 | 2 | 2 | 1 | 1 | checklist |
Use `grid-auto-flow: row dense` so holes fill. Drag-and-drop order preserved.

## Depth system
- **Elevation**: e0 flat (inset areas), e1 card resting, e2 hover / raised hero, e3 floating header & popovers, e4 dialogs.
- **Shadows (dark)**: layered ambient+key: e1 `0 1px 0 rgba(255,255,255,.05) inset, 0 1px 2px rgba(0,0,0,.5), 0 8px 24px -12px rgba(0,0,0,.6)`; e2 adds `0 24px 48px -16px rgba(0,0,0,.7)` + accent glow `0 0 0 1px color-mix(accent 25%)`.
- **Borders**: 1px hairline `rgba(255,255,255,.08)`; top-edge highlight via `inset 0 1px 0 rgba(255,255,255,.06)`; optional gradient border (mask trick) for hero / AI cards.
- **Inner glow / sheen**: radial gradient following pointer (`--lx/--ly`, existing) at 6–10% opacity; static corner glow tinted by domain colour.
- **Gradients**: surface `linear-gradient(180deg, surface+3% , surface)`; domain tint `radial-gradient(120% 80% at 0% 0%, domain/14%, transparent 60%)`. Subtle noise grain overlay (2–3%).
- **Blur**: glass only on floating layers (header, tab bar, popovers, hero) — `backdrop-filter: blur(20–32px) saturate(140%)`; resting cards mostly opaque for perf + contrast.
- **Radius scale**: xs 10, sm 14, md 20, lg 24 (cards), xl 32 (hero/large tiles), pill 999. Large tiles at ≥1920 use xl.
- **Micro-interactions**: hover lift `translateY(-2px)` + e1→e2 (180ms cubic-bezier(.2,.8,.2,1)); press `scale(.985)`; focus-visible 2px ring accent + 2px offset; list rows highlight on hover; numbers count-up optional. All disabled under `prefers-reduced-motion: reduce` (no transform, no tilt).
- **Contrast**: text ≥ 4.5:1 on all surfaces; meta text ≥ 4.5:1 at small sizes; chips use tinted bg + full-strength text.

## Section pages (≥1280)
- Agenda: 2-col — timeline/week (8) + integrations & upcoming deberes rail (4).
- Gimnasio / Cuerpo / Sueño y hábitos / Mente: header stats row (3–4 stat tiles) + main chart (8) + side list/history (4).
- Cuidado / Cuidado personal: 2–3 column card grids (auto-fit minmax(20rem,1fr)).
- Asistente: chat column max 52rem + context rail (suggested prompts, today's summary) at ≥1280.
- Ajustes: 2-col grid of panels at ≥1024.
