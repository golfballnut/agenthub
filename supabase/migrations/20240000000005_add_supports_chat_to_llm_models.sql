-- Add supports_chat column
ALTER TABLE llm_models 
ADD COLUMN supports_chat BOOLEAN NOT NULL DEFAULT false;

-- Update existing models to mark which ones support chat
UPDATE llm_models
SET supports_chat = true
WHERE model_id IN (
  'gpt-4-turbo-preview',
  'gpt-4',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229'
); 