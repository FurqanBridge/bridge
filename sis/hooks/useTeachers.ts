import { createClient } from '@/lib/supabase/client'
import { Teacher, NewTeacher } from '@/types'
import { useState, useEffect } from 'react'

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function fetchTeachers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('name')

    if (error) setError(error.message)
    else setTeachers(data ?? [])
    setLoading(false)
  }

  async function addTeacher(newTeacher: NewTeacher): Promise<boolean> {
    const { error } = await supabase.from('teachers').insert(newTeacher)
    if (error) { setError(error.message); return false }
    await fetchTeachers()
    return true
  }

  async function deleteTeacher(id: string): Promise<boolean> {
    const { error } = await supabase.from('teachers').delete().eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchTeachers()
    return true
  }

  useEffect(() => { fetchTeachers() }, [])

  return { teachers, loading, error, addTeacher, deleteTeacher, refetch: fetchTeachers }
}
