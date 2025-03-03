import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate Supabase URL format
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid Supabase URL. Please ensure VITE_SUPABASE_URL is set correctly and starts with https://');
}

if (!supabaseKey) {
  throw new Error('Missing Supabase anonymous key. Please ensure VITE_SUPABASE_ANON_KEY is set.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export async function getActiveRegulations(chapter?: string): Promise<string> {
  try {
    // First try to get from the regulations table
    let query = supabase
      .from('regulations')
      .select('content')
      .eq('is_active', true);

    if (chapter) {
      query = query.eq('chapter', chapter);
    }

    const { data: tableData, error: tableError } = await query.single();

    if (tableError) {
      console.error('Error fetching regulations:', tableError);
      throw new Error('Failed to fetch regulations');
    }

    if (tableData?.content) {
      return tableData.content;
    }

    // If no data in the database, return a message
    return 'No regulations found. Please upload regulations using the Regulations Manager.';
  } catch (error) {
    console.error('Error fetching regulations:', error);
    throw new Error('Error loading regulations. Please try again or contact support.');
  }
}

export async function updateRegulations(
  chapter: string,
  content: string,
  title: string,
  version: string,
  effectiveDate: Date
): Promise<void> {
  // First, deactivate current active version
  const { error: deactivateError } = await supabase
    .from('regulations')
    .update({ is_active: false })
    .eq('chapter', chapter)
    .eq('is_active', true);

  if (deactivateError) {
    console.error('Error deactivating current regulations:', deactivateError);
    throw new Error('Failed to update regulations. Please try again.');
  }

  // Insert new version
  const { error: insertError } = await supabase
    .from('regulations')
    .insert({
      chapter,
      content,
      title,
      version,
      effective_date: effectiveDate.toISOString(),
      is_active: true
    });

  if (insertError) {
    console.error('Error inserting new regulations:', insertError);
    throw new Error('Failed to update regulations. Please try again.');
  }
}