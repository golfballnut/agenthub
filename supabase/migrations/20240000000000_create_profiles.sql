-- Create a table for public profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  username text unique,
  website text,
  avatar_url text,
  bio text,
  updated_at timestamp with time zone,
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
DO $$ BEGIN
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create policies (only if they don't exist)
DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone."
    ON profiles FOR SELECT
    USING ( true );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create a trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$; 