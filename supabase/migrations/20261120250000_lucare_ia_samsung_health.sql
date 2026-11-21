-- LuCare Fase 5: IA (insights) + Samsung Health / Health Connect import

-- ========== ACTIVIDAD Y PULSO ==========
create table public.daily_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_date date not null,
  steps integer,
  source text not null default 'import'
    check (source in ('samsung_health', 'health_connect', 'import', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, activity_date, source)
);

create table public.heart_rate_samples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_at timestamptz not null,
  bpm smallint not null check (bpm between 30 and 220),
  source text not null default 'import'
    check (source in ('samsung_health', 'health_connect', 'import', 'manual')),
  created_at timestamptz not null default now()
);

create index daily_activities_user_date_idx on public.daily_activities (user_id, activity_date desc);
create index heart_rate_samples_user_time_idx on public.heart_rate_samples (user_id, recorded_at desc);

-- ========== INSIGHTS IA (caché diaria) ==========
create table public.ai_daily_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  insight_date date not null,
  content text not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, insight_date)
);

create trigger daily_activities_updated before update on public.daily_activities
  for each row execute function public.set_updated_at();

create trigger ai_daily_insights_updated before update on public.ai_daily_insights
  for each row execute function public.set_updated_at();

alter table public.daily_activities enable row level security;
alter table public.heart_rate_samples enable row level security;
alter table public.ai_daily_insights enable row level security;

create policy "daily_activities_own" on public.daily_activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "heart_rate_samples_own" on public.heart_rate_samples
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ai_daily_insights_own" on public.ai_daily_insights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Widget insight IA para usuarios existentes
insert into public.dashboard_widgets (user_id, widget_key, visible, sort_order)
select u.id, 'ia_insight', true, 1
from auth.users u
on conflict (user_id, widget_key) do nothing;

-- Nuevos usuarios: incluir ia_insight en el onboarding
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
    (new.id, 'ia_insight', true, 1),
    (new.id, 'bloqueador', true, 2),
    (new.id, 'rutina_am', true, 3),
    (new.id, 'pastillas', true, 4),
    (new.id, 'citas', true, 5),
    (new.id, 'agenda', true, 6),
    (new.id, 'tareas', true, 7),
    (new.id, 'gimnasio', true, 8),
    (new.id, 'cuerpo_resumen', true, 9),
    (new.id, 'sueno', true, 10),
    (new.id, 'habitos_racha', true, 11),
    (new.id, 'animo', true, 12),
    (new.id, 'cuidado_personal', true, 13);

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;
grant execute on function public.handle_new_user() to service_role;