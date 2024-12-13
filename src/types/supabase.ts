export type Database = {
  public: {
    Tables: {
      llm_models: {
        Row: {
          id: string
          provider: string
          model_id: string
          display_name: string
          description: string | null
          active: boolean
          supports_chat: boolean
          created_at: string
          updated_at: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          avatar_url: string | null
          created_at: string
        }
      }
    }
  }
} 