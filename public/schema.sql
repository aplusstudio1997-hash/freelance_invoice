-- ============================================================================
-- So1o Freelancer — Database Schema (idempotent)
-- ============================================================================
-- รันทั้งไฟล์นี้ใน Supabase SQL Editor
-- รันซ้ำได้ปลอดภัย (จะไม่ลบข้อมูลเดิม)
-- ============================================================================

-- ============================================================================
-- 1. profiles
-- ============================================================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id);

create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================================
-- 2. clients
-- ============================================================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text default '',
  email text default '',
  line_id text default '',
  address text default '',
  tax_id text default '',
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists clients_name_idx on public.clients(name);

alter table public.clients enable row level security;

drop policy if exists "clients_select_own" on public.clients;
drop policy if exists "clients_insert_own" on public.clients;
drop policy if exists "clients_update_own" on public.clients;
drop policy if exists "clients_delete_own" on public.clients;
drop policy if exists "clients_select_admin" on public.clients;

create policy "clients_select_own" on public.clients
  for select using (auth.uid() = user_id);

create policy "clients_insert_own" on public.clients
  for insert with check (auth.uid() = user_id);

create policy "clients_update_own" on public.clients
  for update using (auth.uid() = user_id);

create policy "clients_delete_own" on public.clients
  for delete using (auth.uid() = user_id);

create policy "clients_select_admin" on public.clients
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================================
-- 3. documents
-- ============================================================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('quote', 'invoice', 'receipt')),
  number text default '',
  status text not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  linked_from_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents
  add column if not exists client_id uuid references public.clients(id) on delete set null;

create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists documents_type_idx on public.documents(type);
create index if not exists documents_client_id_idx on public.documents(client_id);

alter table public.documents enable row level security;

drop policy if exists "documents_select_own" on public.documents;
drop policy if exists "documents_insert_own" on public.documents;
drop policy if exists "documents_update_own" on public.documents;
drop policy if exists "documents_delete_own" on public.documents;
drop policy if exists "documents_select_admin" on public.documents;

create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);

create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);

create policy "documents_update_own" on public.documents
  for update using (auth.uid() = user_id);

create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

create policy "documents_select_admin" on public.documents
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================================
-- 4. incomes
-- ============================================================================
create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null default 0,
  currency text not null default 'THB',
  category text default 'other',
  source_doc_id uuid references public.documents(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  note text default '',
  received_at date not null default current_date,
  wht_amount numeric default 0,
  vat_amount numeric default 0,
  created_at timestamptz not null default now()
);

create index if not exists incomes_user_id_idx on public.incomes(user_id);
create index if not exists incomes_received_at_idx on public.incomes(received_at desc);

alter table public.incomes enable row level security;

drop policy if exists "incomes_select_own" on public.incomes;
drop policy if exists "incomes_insert_own" on public.incomes;
drop policy if exists "incomes_update_own" on public.incomes;
drop policy if exists "incomes_delete_own" on public.incomes;
drop policy if exists "incomes_select_admin" on public.incomes;

create policy "incomes_select_own" on public.incomes
  for select using (auth.uid() = user_id);

create policy "incomes_insert_own" on public.incomes
  for insert with check (auth.uid() = user_id);

create policy "incomes_update_own" on public.incomes
  for update using (auth.uid() = user_id);

create policy "incomes_delete_own" on public.incomes
  for delete using (auth.uid() = user_id);

create policy "incomes_select_admin" on public.incomes
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================================
-- 5. expenses
-- ============================================================================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null default 0,
  currency text not null default 'THB',
  category text default 'other',
  note text default '',
  paid_at date not null default current_date,
  receipt_url text default '',
  created_at timestamptz not null default now()
);

create index if not exists expenses_user_id_idx on public.expenses(user_id);
create index if not exists expenses_paid_at_idx on public.expenses(paid_at desc);

alter table public.expenses enable row level security;

drop policy if exists "expenses_select_own" on public.expenses;
drop policy if exists "expenses_insert_own" on public.expenses;
drop policy if exists "expenses_update_own" on public.expenses;
drop policy if exists "expenses_delete_own" on public.expenses;
drop policy if exists "expenses_select_admin" on public.expenses;

create policy "expenses_select_own" on public.expenses
  for select using (auth.uid() = user_id);

create policy "expenses_insert_own" on public.expenses
  for insert with check (auth.uid() = user_id);

create policy "expenses_update_own" on public.expenses
  for update using (auth.uid() = user_id);

create policy "expenses_delete_own" on public.expenses
  for delete using (auth.uid() = user_id);

create policy "expenses_select_admin" on public.expenses
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================================
-- 6. revenue_goals
-- ============================================================================
create table if not exists public.revenue_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  month int not null check (month >= 1 and month <= 12),
  amount numeric not null default 0,
  currency text not null default 'THB',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

create index if not exists revenue_goals_user_id_idx on public.revenue_goals(user_id);

alter table public.revenue_goals enable row level security;

drop policy if exists "revenue_goals_select_own" on public.revenue_goals;
drop policy if exists "revenue_goals_insert_own" on public.revenue_goals;
drop policy if exists "revenue_goals_update_own" on public.revenue_goals;
drop policy if exists "revenue_goals_delete_own" on public.revenue_goals;

create policy "revenue_goals_select_own" on public.revenue_goals
  for select using (auth.uid() = user_id);

create policy "revenue_goals_insert_own" on public.revenue_goals
  for insert with check (auth.uid() = user_id);

create policy "revenue_goals_update_own" on public.revenue_goals
  for update using (auth.uid() = user_id);

create policy "revenue_goals_delete_own" on public.revenue_goals
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- 7. subscriptions
-- ============================================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  provider text default '',
  category text default 'other',
  amount numeric not null default 0,
  currency text not null default 'THB',
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly', 'weekly', 'quarterly')),
  next_billing_date date,
  is_active boolean not null default true,
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
drop policy if exists "subscriptions_insert_own" on public.subscriptions;
drop policy if exists "subscriptions_update_own" on public.subscriptions;
drop policy if exists "subscriptions_delete_own" on public.subscriptions;

create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "subscriptions_insert_own" on public.subscriptions
  for insert with check (auth.uid() = user_id);

create policy "subscriptions_update_own" on public.subscriptions
  for update using (auth.uid() = user_id);

create policy "subscriptions_delete_own" on public.subscriptions
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- 8. suppliers
-- ============================================================================
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text default 'other',
  email text default '',
  phone text default '',
  line_id text default '',
  website text default '',
  service_type text default '',
  hourly_rate numeric default 0,
  note text default '',
  files jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists suppliers_user_id_idx on public.suppliers(user_id);

alter table public.suppliers enable row level security;

drop policy if exists "suppliers_select_own" on public.suppliers;
drop policy if exists "suppliers_insert_own" on public.suppliers;
drop policy if exists "suppliers_update_own" on public.suppliers;
drop policy if exists "suppliers_delete_own" on public.suppliers;

create policy "suppliers_select_own" on public.suppliers
  for select using (auth.uid() = user_id);

create policy "suppliers_insert_own" on public.suppliers
  for insert with check (auth.uid() = user_id);

create policy "suppliers_update_own" on public.suppliers
  for update using (auth.uid() = user_id);

create policy "suppliers_delete_own" on public.suppliers
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- 9. feedback
-- ============================================================================
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text default '',
  rating int not null default 0 check (rating >= 0 and rating <= 5),
  message text default '',
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on public.feedback(created_at desc);

alter table public.feedback enable row level security;

drop policy if exists "feedback_insert_anyone" on public.feedback;
drop policy if exists "feedback_select_admin" on public.feedback;

create policy "feedback_insert_anyone" on public.feedback
  for insert with check (true);

create policy "feedback_select_admin" on public.feedback
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================================
-- 10. activity_log
-- ============================================================================
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_user_id_idx on public.activity_log(user_id);
create index if not exists activity_log_created_at_idx on public.activity_log(created_at desc);

alter table public.activity_log enable row level security;

drop policy if exists "activity_log_insert_anyone" on public.activity_log;
drop policy if exists "activity_log_select_own" on public.activity_log;
drop policy if exists "activity_log_select_admin" on public.activity_log;

create policy "activity_log_insert_anyone" on public.activity_log
  for insert with check (true);

create policy "activity_log_select_own" on public.activity_log
  for select using (auth.uid() = user_id);

create policy "activity_log_select_admin" on public.activity_log
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================================
-- 11. active_sessions (heartbeat)
-- ============================================================================
create table if not exists public.active_sessions (
  client_id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  last_seen timestamptz not null default now()
);

create index if not exists active_sessions_last_seen_idx on public.active_sessions(last_seen desc);

alter table public.active_sessions enable row level security;

drop policy if exists "active_sessions_upsert_anyone" on public.active_sessions;
drop policy if exists "active_sessions_select_admin" on public.active_sessions;
drop policy if exists "active_sessions_update_anyone" on public.active_sessions;

create policy "active_sessions_upsert_anyone" on public.active_sessions
  for insert with check (true);

create policy "active_sessions_update_anyone" on public.active_sessions
  for update using (true);

create policy "active_sessions_select_admin" on public.active_sessions
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================================
-- 12. Storage: supplier-files bucket
-- ============================================================================
insert into storage.buckets (id, name, public)
  values ('supplier-files', 'supplier-files', false)
  on conflict (id) do nothing;

drop policy if exists "supplier_files_select_own" on storage.objects;
drop policy if exists "supplier_files_insert_own" on storage.objects;
drop policy if exists "supplier_files_update_own" on storage.objects;
drop policy if exists "supplier_files_delete_own" on storage.objects;

create policy "supplier_files_select_own" on storage.objects
  for select using (
    bucket_id = 'supplier-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "supplier_files_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'supplier-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "supplier_files_update_own" on storage.objects
  for update using (
    bucket_id = 'supplier-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "supplier_files_delete_own" on storage.objects
  for delete using (
    bucket_id = 'supplier-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- 13. Triggers — auto-update updated_at
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_clients on public.clients;
create trigger set_updated_at_clients before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_documents on public.documents;
create trigger set_updated_at_documents before update on public.documents
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_revenue_goals on public.revenue_goals;
create trigger set_updated_at_revenue_goals before update on public.revenue_goals
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_subscriptions on public.subscriptions;
create trigger set_updated_at_subscriptions before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_suppliers on public.suppliers;
create trigger set_updated_at_suppliers before update on public.suppliers
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 14. Auto-create profile when user signs up
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, data, role)
  values (
    new.id,
    jsonb_build_object(
      'email', new.email,
      'studioName', coalesce(new.raw_user_meta_data->>'studio_name', split_part(new.email, '@', 1))
    ),
    'user'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 15. Reload PostgREST schema cache (สำคัญ!)
-- ============================================================================
notify pgrst, 'reload schema';
