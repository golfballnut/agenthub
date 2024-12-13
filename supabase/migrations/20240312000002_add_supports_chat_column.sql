-- Add supports_chat column to llm_models
ALTER TABLE llm_models 
ADD COLUMN IF NOT EXISTS supports_chat BOOLEAN NOT NULL DEFAULT false;

-- Insert initial models
INSERT INTO llm_models (provider, model_id, display_name, description, active, supports_chat)
VALUES 
  ('openai', 'gpt-4-turbo-preview', 'GPT-4 Turbo', 'Latest and most capable GPT-4 model', true, true),
  ('openai', 'gpt-4', 'GPT-4', 'Advanced reasoning and analysis', true, true),
  ('openai', 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'Fast and efficient for most tasks', true, true),
  ('openai', 'gpt-3.5-turbo-16k', 'GPT-3.5 Turbo 16K', 'Extended context window version', true, true),
  ('claude', 'claude-3-opus-20240229', 'Claude 3 Opus', 'Most powerful Claude model', true, true),
  ('claude', 'claude-3-sonnet-20240229', 'Claude 3 Sonnet', 'Balanced performance and efficiency', true, true)
ON CONFLICT (provider, model_id) 
DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  supports_chat = EXCLUDED.supports_chat; 