-- Create LLM models table
CREATE TABLE IF NOT EXISTS llm_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  model_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(provider, model_id)
);

-- Enable RLS
ALTER TABLE llm_models ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "Anyone can read llm_models"
  ON llm_models FOR SELECT
  USING (true);

-- Insert initial models
INSERT INTO llm_models (provider, model_id, display_name, description, active)
VALUES
  ('openai', 'gpt-4-turbo-preview', 'GPT-4 Turbo', 'Latest and most capable GPT-4 model', true),
  ('openai', 'gpt-4', 'GPT-4', 'Advanced reasoning and analysis', true),
  ('openai', 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'Fast and efficient for most tasks', true),
  ('openai', 'gpt-3.5-turbo-16k', 'GPT-3.5 Turbo 16K', 'Extended context window version', true),
  ('claude', 'claude-3-opus-20240229', 'Claude 3 Opus', 'Most powerful Claude model', true),
  ('claude', 'claude-3-sonnet-20240229', 'Claude 3 Sonnet', 'Balanced performance and efficiency', true);

-- Create indexes
CREATE INDEX llm_models_provider_idx ON llm_models(provider);
CREATE INDEX llm_models_active_idx ON llm_models(active); 