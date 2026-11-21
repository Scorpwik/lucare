-- Bloqueador solar: intervalo de reaplicación y recordatorios push.

create table public.user_sunscreen_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_applied_at timestamptz,
  reapply_interval_minutes integer not null default 120 check (reapply_interval_minutes between 60 and 240),
  next_due_at timestamptz,
  last_notified_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_sunscreen_settings_next_due_idx
  on public.user_sunscreen_settings (next_due_at)
  where next_due_at is not null;

create trigger user_sunscreen_settings_updated
  before update on public.user_sunscreen_settings
  for each row execute function public.set_updated_at();

alter table public.user_sunscreen_settings enable row level security;

create policy "sunscreen_all_own" on public.user_sunscreen_settings
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Alternativa si Vercel Hobby no permite cron frecuente (cada 5 min):
-- select cron.schedule(
--   'lucare-sunscreen-push',
--   '*/5 * * * *',
--   $$
--   select net.http_post(
--     url := 'https://TU_DOMINIO/api/cron/sunscreen',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.cron_secret', true),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );