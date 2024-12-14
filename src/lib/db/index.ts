import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import schemaConfig from './schemaConfig'
import * as genericHandlers from './handlers/generic'

type RequestParams = {
  supabase: SupabaseClient<Database>
  table: string
  action: string
  payload?: any
  filters?: Record<string, any>
  user: any
}

const handlerMap = {
  select: genericHandlers.select,
  insert: genericHandlers.insert,
  update: genericHandlers.update,
  delete: genericHandlers.delete_
}

export async function handleRequest({
  supabase,
  table,
  action,
  payload,
  filters,
  user
}: RequestParams) {
  // Verify table exists in schema config
  const tableConfig = schemaConfig[table as keyof typeof schemaConfig]
  if (!tableConfig) {
    throw new Error(`Table ${table} not configured`)
  }

  // Verify action is allowed for table
  if (!tableConfig.actions.includes(action as any)) {
    throw new Error(`Action ${action} not allowed for table ${table}`)
  }

  // Get handler function
  const handler = handlerMap[action as keyof typeof handlerMap]
  if (!handler) {
    throw new Error(`No handler found for action ${action}`)
  }

  // Execute handler
  return handler({ supabase, table, payload, filters, user })
} 