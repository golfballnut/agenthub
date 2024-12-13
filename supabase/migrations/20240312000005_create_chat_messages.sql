-- Create chat_messages table with proper references and RLS
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
DO $$ BEGIN
  ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
  CREATE POLICY "Users can view their own chat messages"
    ON chat_messages FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create their own chat messages" ON chat_messages;
  CREATE POLICY "Users can create their own chat messages"
    ON chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create indexes
DO $$ BEGIN
  DROP INDEX IF EXISTS chat_messages_user_id_idx;
  CREATE INDEX chat_messages_user_id_idx ON chat_messages(user_id);
EXCEPTION
  WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP INDEX IF EXISTS chat_messages_created_at_idx;
  CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at);
EXCEPTION
  WHEN others THEN NULL;
END $$; 