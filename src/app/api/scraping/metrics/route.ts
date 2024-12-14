import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      { count: totalCompetitors },
      { count: totalConditions },
      { count: totalMatches }
    ] = await Promise.all([
      supabase.from('competitors').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('conditions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('matches').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    ]);

    return NextResponse.json({
      totalCompetitors: totalCompetitors || 0,
      totalConditions: totalConditions || 0,
      totalMatches: totalMatches || 0
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 