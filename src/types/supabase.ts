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
      competitors: {
        Row: {
          id: string
          name: string
          website_url: string | null
          last_updated: string
          created_at: string
        }
      }
      conditions: {
        Row: {
          id: string
          condition_name: string
        }
      }
      competitor_condition_lookup: {
        Row: {
          id: string
          competitor_id: string
          condition_id: string
          competitor_condition_name: string
          last_updated: string
        }
      }
      competitor_product_match: {
        Row: {
          id: string
          item_id: string | null
          competitor_id: string
          product_page_url: string
          ball_qty: number | null
          price: number | null
          last_price_change: string | null
          last_scraped: string | null
          on_sale: boolean
          promotion_details: string | null
          daily_traffic: number | null
          daily_traffic_sources: any | null
          last_updated: string
        }
      }
    }
  }
} 