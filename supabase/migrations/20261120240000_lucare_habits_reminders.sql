-- Phase 4: ventanas de recordatorio estilo alarma para hábitos (como cuidado personal).
alter table public.habits
  add column if not exists reminder_enabled boolean not null default false,
  add column if not exists reminder_start_time time,
  add column if not exists reminder_end_time time,
  add column if not exists reminder_interval_minutes integer;