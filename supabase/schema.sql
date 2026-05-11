-- ========================================================================
-- So1o Freelancer — Supabase Schema (Phase 3+)
-- ========================================================================
-- รันใน Supabase SQL Editor ตามลำดับ
-- ปลอดภัยสำหรับโปรเจกต์ที่มี profiles + documents อยู่แล้ว
-- ========================================================================

-- ------------------------------------------------------------------------
-- 1) profiles (มีอยู่แล้วใน Phase 1 — เพิ่ม role column สำหรับ admin)
-- ------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists role text not null default 'user';

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('user', 'admin'));
  end if;
end $$;

-- ------------------------------------------------------------------------
-- 2) clients — Clients CRM (ลูกค้า)
-- ------------------------------------------------------------------------
create table if not exists public.clients (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  phone        text default '',
  email        text default '',
  line_id      text default '',
  address      text default '',
  tax_id       text default '',
  note         text default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists clients_name_idx on public.clients(user_id, name);

-- ------------------------------------------------------------------------
-- 3) documents (มีอยู่แล้ว — เพิ่ม client_id column)
-- ------------------------------------------------------------------------
create table if not exists public.documents (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  type            text not null check (type in ('quote', 'invoice', 'receipt')),
  number          text not null,
  status          text not null default 'draft' check (status in ('draft', 'issued', 'paid', 'cancelled')),
  linked_from_id  uuid references public.documents(id) on delete set null,
  client_id       uuid references public.clients(id) on delete set null,
  data            jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.documents
  add column if not exists client_id uuid references public.clients(id) on delete set null;

create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists documents_client_id_idx on public.documents(client_id);
create index if not exists documents_type_idx on public.documents(user_id, type);

-- ------------------------------------------------------------------------
-- 4) incomes — รายได้ (Phase 4)
-- ------------------------------------------------------------------------
create table if not exists public.incomes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  client_id        uuid references public.clients(id) on delete set null,
  document_id      uuid references public.documents(id) on delete set null,
  category         text default 'service',
  description      text default '',
  amount           numeric(14,2) not null default 0,
  currency         text not null default 'THB',
  wht_amount       numeric(14,2) not null default 0,
  vat_amount       numeric(14,2) not null default 0,
  received_at      date not null default current_date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists incomes_user_id_idx on public.incomes(user_id);
create index if not exists incomes_received_at_idx on public.incomes(user_id, received_at desc);

-- ------------------------------------------------------------------------
-- 5) expenses — รายจ่าย (Phase 4)
-- ------------------------------------------------------------------------
create table if not exists public.expenses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  category      text default 'other',
  description   text default '',
  amount        numeric(14,2) not null default 0,
  currency      text not null default 'THB',
  vat_amount    numeric(14,2) not null default 0,
  vendor        text default '',
  paid_at       date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists expenses_user_id_idx on public.expenses(user_id);
create index if not exists expenses_paid_at_idx on public.expenses(user_id, paid_at desc);

-- ------------------------------------------------------------------------
-- 6) subscriptions — Subscription tracker (Phase 5)
-- ------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  category        text default 'software',
  amount          numeric(14,2) not null default 0,
  currency        text not null default 'THB',
  billing_cycle   text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly', 'quarterly', 'weekly')),
  next_billing_at date,
  active          boolean not null default true,
  notify_days     integer not null default 3,
  note            text default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_next_billing_idx on public.subscriptions(user_id, next_billing_at);

-- ------------------------------------------------------------------------
-- 7) suppliers — Suppliers Hub (Phase 5)
-- ------------------------------------------------------------------------
create table if not exists public.suppliers (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  category       text default 'other',
  phone          text default '',
  email          text default '',
  address        text default '',
  service_type   text default '',
  note           text default '',
  files          jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists suppliers_user_id_idx on public.suppliers(user_id);

-- ------------------------------------------------------------------------
-- 8) revenue_goals — เป้าหมายรายได้รายเดือน (Phase 4)
-- ------------------------------------------------------------------------
create table if not exists public.revenue_goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  year        integer not null,
  month       integer not null check (month between 1 and 12),
  amount      numeric(14,2) not null default 0,
  currency    text not null default 'THB',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, year, month)
);

-- ------------------------------------------------------------------------
-- 9) feedback — ข้อเสนอแนะ (ย้ายจาก GAS)
-- ------------------------------------------------------------------------
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  email       text default '',
  rating      integer not null default 0,
  message     text default '',
  created_at  timestamptz not null default now()
);
create index if not exists feedback_created_idx on public.feedback(created_at desc);

-- ------------------------------------------------------------------------
-- 10) activity_log — กิจกรรมล่าสุด (Phase 6)
-- ------------------------------------------------------------------------
create table if not exists public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  ref_id      uuid,
  message     text default '',
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists activity_log_user_idx on public.activity_log(user_id, created_at desc);

-- ------------------------------------------------------------------------
-- 11) active_sessions — นับ active users (ย้ายจาก GAS)
-- ------------------------------------------------------------------------
create table if not exists public.active_sessions (
  client_id   text primary key,
  user_id     uuid references auth.users(id) on delete set null,
  last_seen   timestamptz not null default now()
);
create index if not exists active_last_seen_idx on public.active_sessions(last_seen desc);

-- ========================================================================
-- ROW LEVEL SECURITY — เปิดทุกตารางและกำหนด policy
-- ========================================================================

alter table public.profiles          enable row level security;
alter table public.clients           enable row level security;
alter table public.documents         enable row level security;
alter table public.incomes           enable row level security;
alter table public.expenses          enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.suppliers         enable row level security;
alter table public.revenue_goals     enable row level security;
alter table public.feedback          enable row level security;
alter table public.activity_log      enable row level security;
alter table public.active_sessions   enable row level security;

-- ----- helper: drop and recreate policies (idempotent) -----
do $$
declare
  t record;
begin
  for t in
    select unnest(array[
      'profiles','clients','documents','incomes','expenses',
      'subscriptions','suppliers','revenue_goals','activity_log'
    ]) as tbl
  loop
    execute format('drop policy if exists "%s_select_own" on public.%I', t.tbl, t.tbl);
    execute format('drop policy if exists "%s_insert_own" on public.%I', t.tbl, t.tbl);
    execute format('drop policy if exists "%s_update_own" on public.%I', t.tbl, t.tbl);
    execute format('drop policy if exists "%s_delete_own" on public.%I', t.tbl, t.tbl);
    execute format('drop policy if exists "%s_admin_all"  on public.%I', t.tbl, t.tbl);
  end loop;
end $$;

-- ----- generic owner policies for all user-owned tables -----
-- profiles uses user_id as PK
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = user_id);

-- helper macro: for each table create user_id policies
do $$
declare
  t record;
begin
  for t in
    select unnest(array[
      'clients','documents','incomes','expenses',
      'subscriptions','suppliers','revenue_goals','activity_log'
    ]) as tbl
  loop
    execute format($p$
      create policy "%1$s_select_own" on public.%1$I
        for select using (auth.uid() = user_id);
      create policy "%1$s_insert_own" on public.%1$I
        for insert with check (auth.uid() = user_id);
      create policy "%1$s_update_own" on public.%1$I
        for update using (auth.uid() = user_id);
      create policy "%1$s_delete_own" on public.%1$I
        for delete using (auth.uid() = user_id);
    $p$, t.tbl);
  end loop;
end $$;

-- ----- admin can read all owner-tables -----
do $$
declare
  t record;
begin
  for t in
    select unnest(array[
      'profiles','clients','documents','incomes','expenses',
      'subscriptions','suppliers','revenue_goals','activity_log','feedback'
    ]) as tbl
  loop
    execute format($p$
      create policy "%1$s_admin_all" on public.%1$I
        for select using (
          exists (
            select 1 from public.profiles p
            where p.user_id = auth.uid() and p.role = 'admin'
          )
        );
    $p$, t.tbl);
  end loop;
end $$;

-- ----- feedback: signed-in users can insert their own; admin read -----
drop policy if exists "feedback_insert_own" on public.feedback;
create policy "feedback_insert_own" on public.feedback
  for insert with check (auth.uid() is null or auth.uid() = user_id);

drop policy if exists "feedback_select_own" on public.feedback;
create policy "feedback_select_own" on public.feedback
  for select using (auth.uid() = user_id);

-- ----- active_sessions: anyone signed-in can upsert their own clientId -----
drop policy if exists "active_select_all"  on public.active_sessions;
drop policy if exists "active_insert_self" on public.active_sessions;
drop policy if exists "active_update_self" on public.active_sessions;
drop policy if exists "active_admin"       on public.active_sessions;

create policy "active_insert_self" on public.active_sessions
  for insert with check (true);
create policy "active_update_self" on public.active_sessions
  for update using (true);
create policy "active_select_all" on public.active_sessions
  for select using (true);

-- ========================================================================
-- UPDATED_AT TRIGGER (auto-update updated_at)
-- ========================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t record;
begin
  for t in
    select unnest(array[
      'profiles','clients','documents','incomes','expenses',
      'subscriptions','suppliers','revenue_goals'
    ]) as tbl
  loop
    execute format('drop trigger if exists trg_touch_updated_at on public.%I', t.tbl);
    execute format($p$
      create trigger trg_touch_updated_at
      before update on public.%1$I
      for each row execute function public.touch_updated_at();
    $p$, t.tbl);
  end loop;
end $$;

-- ========================================================================
-- AUTO-CREATE PROFILE on signup (มี studio_name จาก metadata)
-- ========================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, data, role)
  values (
    new.id,
    jsonb_build_object('studioName', coalesce(new.raw_user_meta_data->>'studio_name', '')),
    'user'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========================================================================
-- STORAGE BUCKET — supplier-files (Phase 5)
-- ========================================================================
-- รันใน SQL Editor เพื่อสร้าง bucket และ policy
-- ถ้า bucket มีอยู่แล้วจะข้าม

insert into storage.buckets (id, name, public)
values ('supplier-files', 'supplier-files', false)
on conflict (id) do nothing;

drop policy if exists "supplier_files_select_own"  on storage.objects;
drop policy if exists "supplier_files_insert_own"  on storage.objects;
drop policy if exists "supplier_files_update_own"  on storage.objects;
drop policy if exists "supplier_files_delete_own"  on storage.objects;

create policy "supplier_files_select_own" on storage.objects
  for select using (
    bucket_id = 'supplier-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "supplier_files_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'supplier-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "supplier_files_update_own" on storage.objects
  for update using (
    bucket_id = 'supplier-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "supplier_files_delete_own" on storage.objects
  for delete using (
    bucket_id = 'supplier-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ========================================================================
-- DONE
-- ========================================================================
-- ตรวจสอบ:
-- select table_name from information_schema.tables where table_schema='public' order by 1;
-- select user_id, role from public.profiles;
--
-- ตั้ง admin ด้วย:
-- update public.profiles set role = 'admin' where user_id = 'YOUR_USER_UUID';
