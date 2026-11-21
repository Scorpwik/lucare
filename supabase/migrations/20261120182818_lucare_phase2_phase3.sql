-- LuCare Fase 2 (Gimnasio) + Fase 3 (Cuerpo, Sueño/Hábitos, Mente, Cuidado personal)
-- Aplicar manualmente en Supabase; no incluye Nutrición (v2).

-- ========== GIMNASIO ==========
create table public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  weekday smallint check (weekday between 0 and 6),
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_id uuid not null references public.workout_templates (id) on delete cascade,
  name text not null,
  machine text,
  default_rest_seconds integer not null default 90,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_id uuid references public.workout_templates (id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.workout_exercises (id) on delete restrict,
  set_number smallint not null,
  reps smallint,
  weight_kg numeric(8, 2),
  rest_seconds integer,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index workout_templates_user_weekday_idx on public.workout_templates (user_id, weekday);
create index workout_sessions_user_started_idx on public.workout_sessions (user_id, started_at desc);
create index workout_sets_session_idx on public.workout_sets (session_id, set_number);

-- ========== CUERPO ==========
create table public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_at date not null default (timezone('America/Guayaquil', now()))::date,
  weight_kg numeric(6, 2),
  waist_cm numeric(6, 2),
  chest_cm numeric(6, 2),
  hips_cm numeric(6, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  caption text,
  taken_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ========== SUEÑO Y HÁBITOS ==========
create table public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sleep_date date not null,
  bedtime time,
  wake_time time,
  hours_slept numeric(4, 2),
  quality_score smallint check (quality_score between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, sleep_date)
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  log_date date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, habit_id, log_date)
);

-- ========== MENTE ==========
create table public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null default (timezone('America/Guayaquil', now()))::date,
  mood smallint not null check (mood between 1 and 5),
  stress smallint check (stress between 1 and 5),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== CUIDADO PERSONAL ==========
create table public.personal_care_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null default 'general',
  sort_order integer not null default 0,
  reminder_enabled boolean not null default false,
  reminder_start_time time,
  reminder_end_time time,
  reminder_interval_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.personal_care_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_id uuid not null references public.personal_care_routines (id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  reminder_enabled boolean not null default false,
  reminder_start_time time,
  reminder_end_time time,
  reminder_interval_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers
create trigger workout_templates_updated before update on public.workout_templates
for each row execute function public.set_updated_at();
create trigger workout_exercises_updated before update on public.workout_exercises
for each row execute function public.set_updated_at();
create trigger workout_sessions_updated before update on public.workout_sessions
for each row execute function public.set_updated_at();
create trigger body_metrics_updated before update on public.body_metrics
for each row execute function public.set_updated_at();
create trigger sleep_logs_updated before update on public.sleep_logs
for each row execute function public.set_updated_at();
create trigger habits_updated before update on public.habits
for each row execute function public.set_updated_at();
create trigger journal_entries_updated before update on public.journal_entries
for each row execute function public.set_updated_at();
create trigger personal_care_routines_updated before update on public.personal_care_routines
for each row execute function public.set_updated_at();
create trigger personal_care_steps_updated before update on public.personal_care_steps
for each row execute function public.set_updated_at();

-- ========== STORAGE (fotos de progreso) ==========
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'progress-photos',
  'progress-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ========== RLS ==========
alter table public.workout_templates enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.body_metrics enable row level security;
alter table public.progress_photos enable row level security;
alter table public.sleep_logs enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.mood_logs enable row level security;
alter table public.journal_entries enable row level security;
alter table public.personal_care_routines enable row level security;
alter table public.personal_care_steps enable row level security;

create policy "workout_templates_own" on public.workout_templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_exercises_own" on public.workout_exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_sessions_own" on public.workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_sets_own" on public.workout_sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "body_metrics_own" on public.body_metrics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_photos_own" on public.progress_photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sleep_logs_own" on public.sleep_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits_own" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habit_logs_own" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mood_logs_own" on public.mood_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "journal_entries_own" on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "personal_care_routines_own" on public.personal_care_routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "personal_care_steps_own" on public.personal_care_steps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage: carpeta por usuario {user_id}/archivo
create policy "progress_photos_select_own" on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "progress_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "progress_photos_update_own" on storage.objects
  for update using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "progress_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Widgets adicionales para usuarios existentes (idempotente)
insert into public.dashboard_widgets (user_id, widget_key, visible, sort_order)
select u.id, w.key, true, w.ord
from auth.users u
cross join (
  values
    ('gimnasio', 7),
    ('cuerpo_resumen', 8),
    ('sueno', 9),
    ('habitos_racha', 10),
    ('animo', 11),
    ('cuidado_personal', 12)
) as w(key, ord)
on conflict (user_id, widget_key) do nothing;