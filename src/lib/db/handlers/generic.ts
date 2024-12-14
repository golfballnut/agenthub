import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

type GenericHandlerParams = {
  supabase: SupabaseClient<Database>
  table: string
  payload?: any
  filters?: Record<string, any>
  user: any
}

export async function select({ supabase, table, filters }: GenericHandlerParams) {
  let query = supabase.from(table).select()
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function insert({ supabase, table, payload }: GenericHandlerParams) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function update({ supabase, table, payload, filters }: GenericHandlerParams) {
  if (!filters) throw new Error('Filters required for update')
  
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .match(filters)
    .select()
    
  if (error) throw error
  return data
}

export async function delete_({ supabase, table, filters }: GenericHandlerParams) {
  if (!filters) throw new Error('Filters required for delete')
  
  const { data, error } = await supabase
    .from(table)
    .delete()
    .match(filters)
    .select()
    
  if (error) throw error
  return data
} 