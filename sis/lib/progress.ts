import type { SupabaseClient } from '@supabase/supabase-js'
import type { StorytellingProgress } from '@/types'

export const PROGRESS_LABEL: Record<StorytellingProgress, string> = {
  pending: 'Pending',
  checked: 'Checked',
  pass: 'Pass',
}

// Circle (button) styles
export const PROGRESS_CIRCLE: Record<StorytellingProgress, string> = {
  pending: 'border-[#d1d5db] hover:border-[#3B5BDB]',
  checked: 'bg-[#16A34A] border-[#16A34A]',
  pass: 'bg-[#EA580C] border-[#EA580C]',
}

// Badge styles
export const PROGRESS_BADGE: Record<StorytellingProgress, string> = {
  pending: 'bg-[#FEF2F2] text-[#DC2626]',
  checked: 'bg-[#DCFCE7] text-[#16A34A]',
  pass: 'bg-[#FFF7ED] text-[#EA580C]',
}

// "Checked" and "Pass" both count as done
export function isDone(p: StorytellingProgress): boolean {
  return p === 'checked' || p === 'pass'
}

// Single click: pending <-> checked (pass goes back to pending)
export function nextOnClick(p: StorytellingProgress): StorytellingProgress {
  return p === 'pending' ? 'checked' : 'pending'
}

// Double click: -> pass (double click on pass goes back to pending)
export function nextOnDoubleClick(p: StorytellingProgress): StorytellingProgress {
  return p === 'pass' ? 'pending' : 'pass'
}

// Keeps the legacy is_checked column in sync (so the checked_at trigger keeps working)
export async function saveProgress(
  supabase: SupabaseClient,
  id: string,
  progress: StorytellingProgress
): Promise<boolean> {
  const { error } = await supabase
    .from('submissions')
    .update({ progress, is_checked: isDone(progress) })
    .eq('id', id)
  return !error
}
