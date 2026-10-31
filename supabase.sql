-- Supabase Dashboard → SQL Editor → New query → paste → Run
create table if not exists public.khan_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.khan_data enable row level security;

-- each user can only see and change their own row
create policy "own row select" on public.khan_data for select using (auth.uid() = user_id);
create policy "own row insert" on public.khan_data for insert with check (auth.uid() = user_id);
create policy "own row update" on public.khan_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own row delete" on public.khan_data for delete using (auth.uid() = user_id);
