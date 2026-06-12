import { createClient } from '@/lib/supabase/client'
import { Storytelling, NewStorytelling, StorytellingWithClass } from '@/types'
import { useState, useEffect } from 'react'

export function useStorytelling(classId?: string) {
  const [storytelling, setStorytelling] = useState<StorytellingWithClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch storytelling — optionally filtered by class
  async function fetchStorytelling() {
    setLoading(true)

    let query = supabase
      .from('storytelling')
      .select('*, classes(name)')
      .order('created_at', { ascending: false })

    if (classId) query = query.eq('class_id', classId)

    const { data, error } = await query

    if (error) setError(error.message)
    else setStorytelling((data as StorytellingWithClass[]) ?? [])
    setLoading(false)
  }

  // Add a new storytelling entry
  async function addStorytelling(newStorytelling: NewStorytelling): Promise<boolean> {
    const { error } = await supabase.from('storytelling').insert(newStorytelling)
    if (error) { setError(error.message); return false }
    await fetchStorytelling()
    return true
  }

  // Update a storytelling entry
  async function updateStorytelling(id: string, updates: Partial<NewStorytelling>): Promise<boolean> {
    const { error } = await supabase.from('storytelling').update(updates).eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchStorytelling()
    return true
  }

  // Delete a storytelling entry
  async function deleteStorytelling(id: string): Promise<boolean> {
    const { error } = await supabase.from('storytelling').delete().eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchStorytelling()
    return true
  }

  useEffect(() => { fetchStorytelling() }, [classId])

  return { storytelling, loading, error, addStorytelling, updateStorytelling, deleteStorytelling, refetch: fetchStorytelling }
}

// Fetch a single storytelling entry by ID
export function useSingleStorytelling(id: string) {
  const [storytelling, setStorytelling] = useState<StorytellingWithClass | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchStorytelling() {
      setLoading(true)
      const { data, error } = await supabase
        .from('storytelling')
        .select('*, classes(name)')
        .eq('id', id)
        .single()

      if (error) setError(error.message)
      else setStorytelling(data as StorytellingWithClass)
      setLoading(false)
    }

    if (id) fetchStorytelling()
  }, [id])

  return { storytelling, loading, error }
}
