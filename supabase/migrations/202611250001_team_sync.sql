-- Run once in Supabase SQL Editor. Uses a two-person, invite-code team and member-only JSON records.
create extension if not exists pgcrypto;
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  invite_code text not null unique default encode(gen_random_bytes(12), 'hex'),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);
create table if not exists public.team_records (
  team_id uuid not null references public.teams(id) on delete cascade,
  record_id text not null check (char_length(record_id) between 1 and 150),
  record_type text not null check (record_type in ('athlete','log','test','run','simulation','workout','settings','tombstone')),
  payload jsonb not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now(),
  primary key (team_id, record_id)
);
create index if not exists team_records_updated_idx on public.team_records(team_id, updated_at desc);
create or replace function public.is_team_member(_team uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.team_members m where m.team_id = _team and m.user_id = (select auth.uid())) $$;
revoke all on function public.is_team_member(uuid) from public;
grant execute on function public.is_team_member(uuid) to authenticated;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_records enable row level security;
create policy "members read own teams" on public.teams for select to authenticated using (public.is_team_member(id));
create policy "members read team roster" on public.team_members for select to authenticated using (public.is_team_member(team_id));
create policy "members read team records" on public.team_records for select to authenticated using (public.is_team_member(team_id));
create policy "members insert team records" on public.team_records for insert to authenticated with check (public.is_team_member(team_id) and owner_id = (select auth.uid()));
create policy "members update own records" on public.team_records for update to authenticated using (public.is_team_member(team_id)) with check (public.is_team_member(team_id));
create policy "members delete own records" on public.team_records for delete to authenticated using (public.is_team_member(team_id) and owner_id = (select auth.uid()));
grant select on public.teams, public.team_members to authenticated;
grant select, insert, update, delete on public.team_records to authenticated;
create or replace function public.create_team(team_name text)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare t public.teams;
begin
  if auth.uid() is null then raise exception 'Sign-in required'; end if;
  if exists(select 1 from public.team_members where user_id = auth.uid()) then raise exception 'Already belongs to a team'; end if;
  insert into public.teams(name,created_by) values (left(coalesce(nullif(trim(team_name),''),'Road to Race'),80),auth.uid()) returning * into t;
  insert into public.team_members(team_id,user_id,role) values (t.id,auth.uid(),'owner');
  return jsonb_build_object('team_id',t.id,'invite_code',t.invite_code);
end $$;
create or replace function public.join_team(_invite_code text)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare t public.teams;
begin
  if auth.uid() is null then raise exception 'Sign-in required'; end if;
  if exists(select 1 from public.team_members where user_id = auth.uid()) then raise exception 'Already belongs to a team'; end if;
  select * into t from public.teams where teams.invite_code = _invite_code for update;
  if not found then raise exception 'Invalid invitation code'; end if;
  if (select count(*) from public.team_members where team_id=t.id) >= 2 then raise exception 'Team is full'; end if;
  insert into public.team_members(team_id,user_id,role) values (t.id,auth.uid(),'member');
  return jsonb_build_object('team_id',t.id,'team_name',t.name);
end $$;
revoke all on function public.create_team(text) from public;
revoke all on function public.join_team(text) from public;
grant execute on function public.create_team(text), public.join_team(text) to authenticated;
