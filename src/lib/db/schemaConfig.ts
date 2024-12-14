import { Database } from '@/types/supabase'

type TableActions = 'select' | 'insert' | 'update' | 'delete'

type SchemaConfig = {
  [K in keyof Database['public']['Tables']]: {
    actions: TableActions[]
    roles: string[]
  }
}

const schemaConfig: SchemaConfig = {
  profiles: {
    actions: ['select', 'update'],
    roles: ['authenticated']
  },
  competitors: {
    actions: ['select', 'insert', 'update', 'delete'],
    roles: ['authenticated']
  },
  chat_messages: {
    actions: ['select', 'insert', 'update', 'delete'], 
    roles: ['authenticated']
  },
  llm_models: {
    actions: ['select'],
    roles: ['authenticated']
  },
  conditions: {
    actions: ['select', 'insert', 'update', 'delete'],
    roles: ['authenticated']
  },
  competitor_condition_lookup: {
    actions: ['select', 'insert', 'delete'],
    roles: ['authenticated']
  },
  competitor_product_match: {
    actions: ['select', 'insert', 'update', 'delete'],
    roles: ['authenticated']
  }
}

export default schemaConfig 