-- datemarket.ru — Supabase Database Schema
-- Запустить в Supabase SQL Editor

create extension if not exists "uuid-ossp";

create type gender as enum ('male', 'female');
create type gift_status as enum ('pending', 'ordered', 'delivered', 'cancelled');
create type popularity_level as enum ('новенькая', 'востребована', 'популярная', 'горячая', 'звезда');

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  gender        gender not null,
  name          text not null,
  age           int check (age between 18 and 80),
  city          text,
  bio           text,
  avatar_url    text,
  is_verified   boolean default false,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  last_seen_at  timestamptz default now()
);

create table public.male_profiles (
  user_id               uuid primary key references public.profiles(id) on delete cascade,
  attractiveness_score  int default 0 check (attractiveness_score between 0 and 100),
  wealth_score          int default 0 check (wealth_score between 0 and 100),
  total_score           int generated always as (round(attractiveness_score * 0.55 + wealth_score * 0.45)::int) stored,
  total_gifts_sent      int default 0,
  total_gifts_value     numeric(10,2) default 0,
  reply_received_count  int default 0,
  messages_sent_total   int default 0,
  rank_position         int,
  updated_at            timestamptz default now()
);

create table public.female_profiles (
  user_id               uuid primary key references public.profiles(id) on delete cascade,
  wishlist              jsonb default '[]'::jsonb,
  incoming_messages_24h int default 0,
  incoming_messages_7d  int default 0,
  admirers_count        int default 0,
  reply_rate            numeric(5,2) default 0,
  daily_login_frequency numeric(4,2) default 0,
  popularity_score      int default 0,
  popularity_level      popularity_level default 'новенькая',
  rank_position         int,
  welcome_gift_claimed  boolean default false,
  welcome_gift_amount   numeric(6,2),
  updated_at            timestamptz default now()
);

create table public.messages (
  id          uuid primary key default uuid_generate_v4(),
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content     text not null check (length(content) between 1 and 2000),
  is_read     boolean default false,
  created_at  timestamptz default now(),
  constraint different_users check (sender_id != receiver_id)
);

create index messages_receiver_idx on public.messages(receiver_id, created_at desc);
create index messages_sender_idx on public.messages(sender_id, created_at desc);

create table public.gifts (
  id              uuid primary key default uuid_generate_v4(),
  sender_id       uuid not null references public.profiles(id),
  receiver_id     uuid not null references public.profiles(id),
  ozon_item_url   text not null,
  ozon_item_name  text not null,
  amount          numeric(8,2) not null check (amount > 0),
  platform_fee    numeric(8,2) generated always as (round(amount * 0.10, 2)) stored,
  status          gift_status default 'pending',
  pickup_point    text,
  is_welcome_gift boolean default false,
  created_at      timestamptz default now()
);

create table public.platform_stats (
  id                    int primary key default 1,
  total_users           int default 0,
  male_count            int default 0,
  female_count          int default 0,
  avg_reply_rate        numeric(5,2) default 0,
  second_reply_rate     numeric(5,2) default 0,
  avg_admirers          numeric(6,2) default 0,
  avg_incoming_messages numeric(6,2) default 0,
  new_registrations_24h int default 0,
  online_now            int default 0,
  gifts_today           int default 0,
  messages_last_hour    int default 0,
  updated_at            timestamptz default now()
);

insert into public.platform_stats(id) values(1) on conflict do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.male_profiles enable row level security;
alter table public.female_profiles enable row level security;
alter table public.messages enable row level security;
alter table public.gifts enable row level security;
alter table public.platform_stats enable row level security;

create policy "Profiles are public" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Male profiles public" on public.male_profiles for select using (true);
create policy "Male update own" on public.male_profiles for update using (auth.uid() = user_id);
create policy "Male insert own" on public.male_profiles for insert with check (auth.uid() = user_id);
create policy "Female profiles public" on public.female_profiles for select using (true);
create policy "Female update own" on public.female_profiles for update using (auth.uid() = user_id);
create policy "Female insert own" on public.female_profiles for insert with check (auth.uid() = user_id);
create policy "Message participants" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Send messages" on public.messages for insert with check (auth.uid() = sender_id);
create policy "Stats are public" on public.platform_stats for select using (true);

-- Wishlist max 3
create or replace function validate_wishlist() returns trigger language plpgsql as $$
begin
  if jsonb_array_length(new.wishlist) > 3 then raise exception 'Wishlist max 3 items'; end if;
  return new;
end; $$;

create trigger check_wishlist_size before insert or update on public.female_profiles for each row execute function validate_wishlist();

-- Refresh platform stats
create or replace function refresh_platform_stats() returns void language plpgsql security definer as $$
begin
  update public.platform_stats set
    total_users = (select count(*) from public.profiles where is_active = true),
    male_count = (select count(*) from public.profiles where gender = 'male' and is_active = true),
    female_count = (select count(*) from public.profiles where gender = 'female' and is_active = true),
    new_registrations_24h = (select count(*) from public.profiles where created_at > now() - interval '24 hours'),
    online_now = (select count(*) from public.profiles where last_seen_at > now() - interval '5 minutes'),
    gifts_today = (select count(*) from public.gifts where created_at > now() - interval '24 hours'),
    messages_last_hour = (select count(*) from public.messages where created_at > now() - interval '1 hour'),
    updated_at = now()
  where id = 1;
end; $$;

-- Realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.platform_stats;

-- Storage
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
create policy "Avatar public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "Avatar auth upload" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() is not null);