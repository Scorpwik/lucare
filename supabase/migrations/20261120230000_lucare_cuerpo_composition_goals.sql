-- Phase 3 Cuerpo: composición corporal + meta corporal (aplicar manualmente en Supabase)

alter table public.body_metrics
  add column if not exists body_fat_pct numeric(5, 2),
  add column if not exists muscle_mass_kg numeric(6, 2),
  add column if not exists arm_cm numeric(6, 2),
  add column if not exists thigh_cm numeric(6, 2);

create table if not exists public.body_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  target_weight_kg numeric(6, 2),
  target_waist_cm numeric(6, 2),
  target_body_fat_pct numeric(5, 2),
  reminder_time time,
  reminder_enabled boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint body_goals_user_unique unique (user_id)
);

create trigger body_goals_updated before update on public.body_goals
  for each row execute function public.set_updated_at();

alter table public.body_goals enable row level security;

create policy "body_goals_own" on public.body_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);