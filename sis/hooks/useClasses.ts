import { createClient } from '@/lib/supabase/client'
import { Class, NewClass } from '@/types'
import { useState, useEffect } from 'react'

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch all classes
  async function fetchClasses() {
    setLoading(true)
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name')

    if (error) setError(error.message)
    else setClasses(data ?? [])
    setLoading(false)
  }

  // Add a new class
  async function addClass(newClass: NewClass): Promise<boolean> {
    const { error } = await supabase.from('classes').insert(newClass)
    if (error) { setError(error.message); return false }
    await fetchClasses()
    return true
  }

  // Delete a class
  async function deleteClass(id: string): Promise<boolean> {
    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchClasses()
    return true
  }

  useEffect(() => { fetchClasses() }, [])

  return { classes, loading, error, addClass, deleteClass, refetch: fetchClasses }
}
