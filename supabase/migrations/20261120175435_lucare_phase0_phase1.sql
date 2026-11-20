-- LuCare Fase 0 + 1 — esquema base con RLS

create extension if not exists "pgcrypto";

-- Perfil
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  timezone text not null default 'America/Guayaquil',
  active_hours_start time not null default '07:00',
  active_hours_end time not null default '22:00',
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Widgets del panel Hoy
create table public.dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  widget_key text not null,
  visible boolean not null default true,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, widget_key)
);

-- Suscripciones Web Push
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

-- Rutinas de skincare
create table public.skincare_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  period text not null check (period in ('am', 'pm', 'custom')),
  sort_order integer not null default 0,
  reminder_enabled boolean not null default false,
  reminder_start_time time,
  reminder_end_time time,
  reminder_interval_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skincare_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_id uuid not null references public.skincare_routines (id) on delete cascade,
  title text not null,
  product_name text,
  scheduled_time time,
  sort_order integer not null default 0,
  reminder_enabled boolean not null default false,
  reminder_start_time time,
  reminder_end_time time,
  reminder_interval_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Medicamentos
create table public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  dosage text,
  notes text,
  reminder_enabled boolean not null default true,
  reminder_start_time time,
  reminder_end_time time,
  reminder_interval_minutes integer,
  reminder_times text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Citas médicas
create table public.medical_appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  provider text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  notes text,
  reminder_enabled boolean not null default true,
  reminder_minutes_before integer default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Registro de cuidado (tomas, aplicaciones)
create table public.care_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_type text not null check (
    log_type in ('skincare_step', 'medication', 'appointment', 'custom')
  ),
  reference_id uuid,
  logged_at timestamptz not null default now(),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Tareas básicas
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  due_at timestamptz,
  completed boolean not null default false,
  module_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Conexiones de agenda (Google / Notion) — preparado Fase 4
create table public.calendar_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('google_calendar', 'notion_deberes')),
  status text not null default 'disconnected' check (
    status in ('disconnected', 'connected', 'error', 'syncing')
  ),
  external_account_id text,
  metadata jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

-- Caché de eventos externos (sincronización periódica)
create table public.external_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null,
  external_id text not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  source_label text not null default 'calendar',
  raw jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  unique (user_id, provider, external_id)
);

create table public.external_notion_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  external_id text not null,
  title text not null,
  due_at timestamptz,
  status text,
  raw jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  unique (user_id, external_id)
);

-- Cola de recordatorios programados
create table public.scheduled_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_type text not null,
  source_id uuid not null,
  title text not null,
  body text,
  fire_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index scheduled_reminders_fire_at_idx on public.scheduled_reminders (fire_at)
where sent_at is null;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();
create trigger dashboard_widgets_updated before update on public.dashboard_widgets
for each row execute function public.set_updated_at();
create trigger skincare_routines_updated before update on public.skincare_routines
for each row execute function public.set_updated_at();
create trigger skincare_steps_updated before update on public.skincare_steps
for each row execute function public.set_updated_at();
create trigger medications_updated before update on public.medications
for each row execute function public.set_updated_at();
create trigger medical_appointments_updated before update on public.medical_appointments
for each row execute function public.set_updated_at();
create trigger tasks_updated before update on public.tasks
for each row execute function public.set_updated_at();
create trigger calendar_links_updated before update on public.calendar_links
for each row execute function public.set_updated_at();

-- Perfil automático al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));

  insert into public.dashboard_widgets (user_id, widget_key, visible, sort_order)
  values
    (new.id, 'saludo', true, 0),
    (new.id, 'bloqueador', true, 1),
    (new.id, 'rutina_am', true, 2),
    (new.id, 'pastillas', true, 3),
    (new.id, 'citas', true, 4),
    (new.id, 'agenda', true, 5),
    (new.id, 'tareas', true, 6);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.dashboard_widgets enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.skincare_routines enable row level security;
alter table public.skincare_steps enable row level security;
alter table public.medications enable row level security;
alter table public.medical_appointments enable row level security;
alter table public.care_logs enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_links enable row level security;
alter table public.external_calendar_events enable row level security;
alter table public.external_notion_tasks enable row level security;
alter table public.scheduled_reminders enable row level security;

-- Políticas: propietario vía auth.uid()
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "widgets_all_own" on public.dashboard_widgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "push_all_own" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "skincare_routines_all_own" on public.skincare_routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "skincare_steps_all_own" on public.skincare_steps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "medications_all_own" on public.medications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "appointments_all_own" on public.medical_appointments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "care_logs_all_own" on public.care_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks_all_own" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "calendar_links_all_own" on public.calendar_links
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ext_events_all_own" on public.external_calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ext_notion_all_own" on public.external_notion_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reminders_all_own" on public.scheduled_reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);