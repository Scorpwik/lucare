-- Tokens OAuth de integraciones (solo servidor / service role — sin políticas para clients)

create table public.integration_oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('google_calendar')),
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  expires_at timestamptz,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create trigger integration_oauth_tokens_updated
  before update on public.integration_oauth_tokens
  for each row execute function public.set_updated_at();

alter table public.integration_oauth_tokens enable row level security;

-- Sin políticas: usuarios autenticados y anon no pueden leer/escribir tokens.
-- El service role de Supabase omite RLS para rutas API del servidor.