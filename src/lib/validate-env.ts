export function validateEnv() {
  const requiredVars = {
    'PROVIDER_OPENAI_API_KEY': process.env.PROVIDER_OPENAI_API_KEY,
    'PROVIDER_CLAUDE_API_KEY': process.env.PROVIDER_CLAUDE_API_KEY,
    'PROVIDER_PERPLEXITY_API_KEY': process.env.PROVIDER_PERPLEXITY_API_KEY,
  }

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`)
    return false
  }

  return true
} 