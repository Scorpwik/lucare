-- Corrige avisos de seguridad del advisor: search_path fijo y revocar EXECUTE pública.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

-- El trigger on_auth_user_created invoca esta función como SECURITY DEFINER;
-- no debe ser ejecutable directamente vía RPC por roles expuestos.
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

grant execute on function public.handle_new_user() to service_role;