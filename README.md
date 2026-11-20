# LuCare

Super app personal de salud y organización (Joshua). Stack: **Next.js 16** (App Router + `proxy.ts`), **TypeScript**, **Tailwind v4**, **shadcn/ui**, **Lucide**, **Supabase** (Auth, Postgres + RLS), **PWA** con Serwist. Interfaz en español (Ecuador, `America/Guayaquil`).

Sistema de diseño **Instrumento vivo v3** (IBM Plex Sans/Mono, Doto, vidrio, sombras 1–4, rojo de señal `#C51E2A`). Referencia: `docs/lucare-v3.html`.

## Alcance actual (Fase 0–3)

- Layout **PC** (sidebar) y **móvil** (4 pestañas + hoja «Más»)
- Auth Supabase (magic link + correo/contraseña) + **modo demo** explícito por flag
- Panel **Hoy** personalizable (orden/visibilidad; persiste en demo local y en `dashboard_widgets` con Supabase)
- **Cuidado**: rutinas, medicamentos, citas (CRUD con ventanas de recordatorio)
- **Gimnasio** (`/gimnasio`): plantillas por día, sesión en vivo, temporizador de descanso, estadísticas (recharts)
- **Cuerpo**: medidas y fotos de progreso (bucket `progress-photos` con URLs firmadas en producción)
- **Sueño y hábitos**: registro de sueño, hábitos con racha (chip ámbar solo en rachas)
- **Mente**: ánimo, journal breve, respiración 4-4-4
- **Cuidado personal**: rutinas con ventana de alarma
- Recordatorios Web Push, integraciones Google/Notion (stubs), migraciones Supabase con RLS
- PWA: `public/manifest.json`, iconos `public/icons/`, Serwist

**Fuera de alcance:** Nutrición, OAuth real en producción, aplicar migraciones a un proyecto remoto desde este repo.

## Requisitos

- Node.js 20+
- npm

## Variables de entorno

Copia `.env.example` a `.env.local`.

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon / publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor (push/API) |
| `LUCARE_DEMO_MODE` / `NEXT_PUBLIC_LUCARE_DEMO_MODE` | Solo si es `true`: datos demo sin Supabase |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push |
| `GOOGLE_*` / `NOTION_*` | Integraciones (stubs) |

Para **deploy en Vercel** con datos reales:

- `LUCARE_DEMO_MODE=false`
- `NEXT_PUBLIC_LUCARE_DEMO_MODE=false`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- VAPID (opcional hasta activar push)

## Desarrollo local (modo demo)

```bash
cp .env.example .env.local
# LUCARE_DEMO_MODE=true
# NEXT_PUBLIC_LUCARE_DEMO_MODE=true

npm install
npm run dev -- --port 4321 --hostname 127.0.0.1
```

1. Abre `http://127.0.0.1:4321/login` → **Entrar en modo demo**
2. Explora **Hoy**, **Gimnasio**, **Cuidado**, módulos mentales/cuerpo, **Agenda**, **Ajustes**

## Supabase local (opcional)

```bash
npx supabase start
npx supabase db reset   # aplica migraciones en supabase/migrations/
```

Migraciones relevantes:

- `20261120175435_lucare_phase0_phase1.sql` — núcleo Fase 0–1
- `20261120182818_lucare_phase2_phase3.sql` — gimnasio, cuerpo, sueño/hábitos, mente, cuidado personal
- `20261120201802_lucare_advisor_function_hardening.sql` — `search_path` fijo y permisos en `handle_new_user`

**No** ejecutar `db push` contra producción desde el agente; aplicar manualmente en el dashboard Supabase.

## Scripts

```bash
npm run dev
npm run build      # usar LUCARE_DEMO_MODE=true si no hay Supabase en CI local
npm run start
npm run lint
npm run typecheck
node scripts/generate-pwa-icons.mjs   # requiere sharp (dev)
```

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/hoy` | Panel diario personalizable |
| `/gimnasio` | Gym (rutina, plantillas, stats); `/gym` redirige aquí |
| `/cuidado` | Piel, pastillas, citas |
| `/cuidado-personal` | Rutinas de higiene y cuidado |
| `/cuerpo` | Peso, medidas, fotos |
| `/sueno-habitos` | Sueño manual + hábitos |
| `/mente` | Ánimo, journal, respiración |
| `/agenda` | Calendario e integraciones |
| `/ajustes` | Tema, push, widgets |
| `/login` | Sesión Supabase o demo |

## Despliegue (Vercel)

Conecta el repo, define las variables anteriores y despliega. No expongas `SUPABASE_SERVICE_ROLE_KEY` en variables `NEXT_PUBLIC_*`.

---

*LuCare — en honor a Lucas.*