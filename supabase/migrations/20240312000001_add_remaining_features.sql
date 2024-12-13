-- Create tables
DO $$ BEGIN
  -- Create llm_models table if not exists
  CREATE TABLE IF NOT EXISTS llm_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL,
    model_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    supports_chat BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider, model_id)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  -- Create agents table if not exists
  CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Enable RLS
DO $$ BEGIN
  ALTER TABLE llm_models ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read llm_models" ON llm_models;
  CREATE POLICY "Anyone can read llm_models"
    ON llm_models FOR SELECT
    USING (true);
EXCEPTION
  WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own agents" ON agents;
  CREATE POLICY "Users can view their own agents"
    ON agents FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create their own agents" ON agents;
  CREATE POLICY "Users can create their own agents"
    ON agents FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create indexes
DO $$ BEGIN
  DROP INDEX IF EXISTS llm_models_provider_idx;
  CREATE INDEX llm_models_provider_idx ON llm_models(provider);
EXCEPTION
  WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP INDEX IF EXISTS llm_models_active_idx;
  CREATE INDEX llm_models_active_idx ON llm_models(active);
EXCEPTION
  WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP INDEX IF EXISTS agents_team_id_idx;
  CREATE INDEX agents_team_id_idx ON agents(team_id);
EXCEPTION
  WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP INDEX IF EXISTS agents_user_id_idx;
  CREATE INDEX agents_user_id_idx ON agents(user_id);
EXCEPTION
  WHEN others THEN NULL;
END $$; 