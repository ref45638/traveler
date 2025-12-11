-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Users)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- 2. TRIPS
create table trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null, -- Links to the logged-in user
  title text not null,
  start_date date,
  end_date date,
  location text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TRIP DAYS
create table trip_days (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  day_index integer not null,
  date date not null
);

-- 4. TRIP ITEMS (Itinerary)
create table trip_items (
  id uuid default uuid_generate_v4() primary key,
  day_id uuid references trip_days(id) on delete cascade not null,
  type text, -- 'activity', 'food', 'transport', etc.
  title text,
  description text,
  time text,
  location text,
  cost numeric,
  image text,
  completed boolean default false,
  order_index integer
);

-- 5. EXPENSES
create table expenses (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  title text not null,
  amount numeric not null,
  payer text,
  date date,
  category text,
  note text,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. PAYERS
create table payers (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  name text not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table trips enable row level security;
alter table trip_days enable row level security;
alter table trip_items enable row level security;
alter table expenses enable row level security;
alter table payers enable row level security;

-- Create Policies (Allow users to see/edit ONLY their own trips)

-- Profiles: Users can see and update their own profile
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Trips: Users can only see/edit trips where they are the owner (user_id)
create policy "Users can view own trips" on trips for select using ( auth.uid() = user_id );
create policy "Users can insert own trips" on trips for insert with check ( auth.uid() = user_id );
create policy "Users can update own trips" on trips for update using ( auth.uid() = user_id );
create policy "Users can delete own trips" on trips for delete using ( auth.uid() = user_id );

-- Helper function to check trip ownership for child tables
-- (Simple approach: we assume if you can see the trip, you can see the details. 
-- Since we filtered trips by user_id, we can join or just rely on the app logic + RLS.
-- For strict RLS, we check if the parent trip belongs to the user.)

-- Trip Days
create policy "Users can view days of own trips" on trip_days for select using (
  exists ( select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid() )
);
create policy "Users can insert days to own trips" on trip_days for insert with check (
  exists ( select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid() )
);
create policy "Users can update days of own trips" on trip_days for update using (
  exists ( select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid() )
);
create policy "Users can delete days of own trips" on trip_days for delete using (
  exists ( select 1 from trips where trips.id = trip_days.trip_id and trips.user_id = auth.uid() )
);

-- Trip Items
create policy "Users can view items of own trips" on trip_items for select using (
  exists ( select 1 from trip_days join trips on trip_days.trip_id = trips.id where trip_days.id = trip_items.day_id and trips.user_id = auth.uid() )
);
create policy "Users can insert items to own trips" on trip_items for insert with check (
  exists ( select 1 from trip_days join trips on trip_days.trip_id = trips.id where trip_days.id = trip_items.day_id and trips.user_id = auth.uid() )
);
create policy "Users can update items of own trips" on trip_items for update using (
  exists ( select 1 from trip_days join trips on trip_days.trip_id = trips.id where trip_days.id = trip_items.day_id and trips.user_id = auth.uid() )
);
create policy "Users can delete items of own trips" on trip_items for delete using (
  exists ( select 1 from trip_days join trips on trip_days.trip_id = trips.id where trip_days.id = trip_items.day_id and trips.user_id = auth.uid() )
);

-- Expenses
create policy "Users can view expenses of own trips" on expenses for select using (
  exists ( select 1 from trips where trips.id = expenses.trip_id and trips.user_id = auth.uid() )
);
create policy "Users can insert expenses to own trips" on expenses for insert with check (
  exists ( select 1 from trips where trips.id = expenses.trip_id and trips.user_id = auth.uid() )
);
create policy "Users can update expenses of own trips" on expenses for update using (
  exists ( select 1 from trips where trips.id = expenses.trip_id and trips.user_id = auth.uid() )
);
create policy "Users can delete expenses of own trips" on expenses for delete using (
  exists ( select 1 from trips where trips.id = expenses.trip_id and trips.user_id = auth.uid() )
);

-- Payers
create policy "Users can view payers of own trips" on payers for select using (
  exists ( select 1 from trips where trips.id = payers.trip_id and trips.user_id = auth.uid() )
);
create policy "Users can insert payers to own trips" on payers for insert with check (
  exists ( select 1 from trips where trips.id = payers.trip_id and trips.user_id = auth.uid() )
);
create policy "Users can update payers of own trips" on payers for update using (
  exists ( select 1 from trips where trips.id = payers.trip_id and trips.user_id = auth.uid() )
);
create policy "Users can delete payers of own trips" on payers for delete using (
  exists ( select 1 from trips where trips.id = payers.trip_id and trips.user_id = auth.uid() )
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


create or replace function delete_user()
returns void
language plpgsql
security definer
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
