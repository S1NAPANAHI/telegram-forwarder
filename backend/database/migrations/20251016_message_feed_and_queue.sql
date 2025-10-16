-- Create message_feed table
create table if not exists public.message_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  queue_id uuid null,
  title text,
  content text,
  data jsonb,
  created_at timestamptz not null default now()
);

-- Create message_queue table (if not already created by user, ensure columns)
create table if not exists public.message_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  channel_id uuid,
  original_chat_id text,
  message_text text,
  message_type text,
  matched_keywords jsonb,
  message_data jsonb,
  status text not null default 'pending',
  failure_reason text,
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

-- Indexes
create index if not exists idx_message_feed_user_created on public.message_feed(user_id, created_at desc);
create index if not exists idx_message_queue_user_created on public.message_queue(user_id, created_at desc);

-- Enable RLS
alter table public.message_feed enable row level security;
alter table public.message_queue enable row level security;

-- Policies for message_feed
create policy if not exists "feed select own"
  on public.message_feed for select
  using (user_id = auth.uid());

create policy if not exists "feed insert own"
  on public.message_feed for insert
  with check (user_id = auth.uid());

create policy if not exists "feed delete own"
  on public.message_feed for delete
  using (user_id = auth.uid());

-- Policies for message_queue
create policy if not exists "queue select own"
  on public.message_queue for select
  using (user_id = auth.uid());

create policy if not exists "queue insert own"
  on public.message_queue for insert
  with check (user_id = auth.uid());

create policy if not exists "queue update own"
  on public.message_queue for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Optional stats helper
create or replace function public.get_message_queue_stats(p_user_id uuid)
returns table(total bigint, pending bigint, delivered bigint, failed bigint)
language sql stable as $$
  select 
    count(*) as total,
    count(*) filter (where status = 'pending') as pending,
    count(*) filter (where status = 'delivered') as delivered,
    count(*) filter (where status = 'failed') as failed
  from public.message_queue
  where user_id = p_user_id;
$$;