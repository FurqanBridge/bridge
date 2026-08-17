import { createClient } from '@/lib/supabase/client'
import { MakeupSchedule, MakeupScheduleWithDetails, NewMakeupSchedule, UpdateMakeupSchedule } from '@/types'
import { useState, useEffect } from 'react'

interface MakeupFilters {
  classId?: string
  studentId?: string
  teacherId?: string
  progress?: string
}

export function useMakeup(filters: MakeupFilters = {}) {
  const [makeupSchedules, setMakeupSchedules] = useState<MakeupScheduleWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function fetchMakeup() {
    setLoading(true)

    let query = supabase
      .from('makeup_schedules')
      .select(`
        *,
        students(name),
        classes(name),
        teachers(name)
      `)
      .order('created_at', { ascending: false })

    if (filters.classId) query = query.eq('class_id', filters.classId)
    if (filters.studentId) query = query.eq('student_id', filters.studentId)
    if (filters.teacherId) query = query.eq('teacher_id', filters.teacherId)
    if (filters.progress) query = query.eq('progress', filters.progress)

    const { data, error } = await query

    if (error) setError(error.message)
    else setMakeupSchedules((data as MakeupScheduleWithDetails[]) ?? [])
    setLoading(false)
  }

  async function addMakeup(newMakeup: NewMakeupSchedule): Promise<boolean> {
    const { error } = await supabase.from('makeup_schedules').insert(newMakeup)
    if (error) { setError(error.message); return false }
    await fetchMakeup()
    return true
  }

  async function updateMakeup(id: string, updates: UpdateMakeupSchedule): Promise<boolean> {
    const { error } = await supabase.from('makeup_schedules').update(updates).eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchMakeup()
    return true
  }

  async function deleteMakeup(id: string): Promise<boolean> {
    const { error } = await supabase.from('makeup_schedules').delete().eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchMakeup()
    return true
  }

  useEffect(() => {
    fetchMakeup()
  }, [filters.classId, filters.studentId, filters.teacherId, filters.progress])

  return {
    makeupSchedules,
    loading,
    error,
    addMakeup,
    updateMakeup,
    deleteMakeup,
    refetch: fetchMakeup,
  }
}

// Fetch a single makeup schedule by ID
export function useSingleMakeup(id: string) {
  const [makeup, setMakeup] = useState<MakeupScheduleWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchMakeup() {
      setLoading(true)
      const { data, error } = await supabase
        .from('makeup_schedules')
        .select(`
          *,
          students(name),
          classes(name),
          teachers(name)
        `)
        .eq('id', id)
        .single()

      if (error) setError(error.message)
      else setMakeup(data as MakeupScheduleWithDetails)
      setLoading(false)
    }

    if (id) fetchMakeup()
  }, [id])

  return { makeup, loading, error }
}
