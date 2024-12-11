-- Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Drop existing policies if they exist (only if table exists)
do $$ 
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'profiles') then
    drop policy if exists "Users can view own profile" on public.profiles;
    drop policy if exists "Users can update own profile" on public.profiles;
  end if;
end $$;

-- Create policy for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Function to handle new user profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 