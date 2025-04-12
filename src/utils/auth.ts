import { SupabaseClient } from '@supabase/supabase-js';

export async function signOut(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateProfile(supabase: SupabaseClient, updates: any) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', updates.id);
  if (error) throw error;
}

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
} 