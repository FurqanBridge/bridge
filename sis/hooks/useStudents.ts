import { createClient } from '@/lib/supabase/client'
import { Student, NewStudent, StudentWithClass } from '@/types'
import { useState, useEffect } from 'react'

export function useStudents(classId?: string, activeOnly: boolean = true) {
  const [students, setStudents] = useState<StudentWithClass[]>([])
  const [archivedStudents, setArchivedStudents] = useState<StudentWithClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function fetchStudents() {
    setLoading(true)

    // Fetch active students
    let activeQuery = supabase
      .from('students')
      .select('*, classes(name)')
      .eq('is_active', true)
      .order('name')

    if (classId) activeQuery = activeQuery.eq('class_id', classId)

    // Fetch archived students
    let archivedQuery = supabase
      .from('students')
      .select('*, classes(name)')
      .eq('is_active', false)
      .order('name')

    if (classId) archivedQuery = archivedQuery.eq('class_id', classId)

    const [activeResult, archivedResult] = await Promise.all([
      activeQuery,
      archivedQuery,
    ])

    if (activeResult.error) setError(activeResult.error.message)
    else setStudents((activeResult.data as StudentWithClass[]) ?? [])

    if (!archivedResult.error) {
      setArchivedStudents((archivedResult.data as StudentWithClass[]) ?? [])
    }

    setLoading(false)
  }

  // Add a new student
  async function addStudent(newStudent: NewStudent): Promise<boolean> {
    const { error } = await supabase.from('students').insert({
      ...newStudent,
      is_active: true,
    })
    if (error) { setError(error.message); return false }
    await fetchStudents()
    return true
  }

  // Update a student
  async function updateStudent(id: string, updates: Partial<NewStudent>): Promise<boolean> {
    const { error } = await supabase.from('students').update(updates).eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchStudents()
    return true
  }

  // Archive a student (soft delete — preserves all submissions)
  async function archiveStudent(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('students')
      .update({ is_active: false })
      .eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchStudents()
    return true
  }

  // Reactivate an archived student (optionally move to a new class)
  async function reactivateStudent(id: string, newClassId?: string): Promise<boolean> {
    const updates: any = { is_active: true }
    if (newClassId) updates.class_id = newClassId
    const { error } = await supabase.from('students').update(updates).eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchStudents()
    return true
  }

  // Hard delete — only use if student has no submissions
  async function deleteStudent(id: string): Promise<boolean> {
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchStudents()
    return true
  }

  useEffect(() => { fetchStudents() }, [classId])

  return {
    students,
    archivedStudents,
    loading,
    error,
    addStudent,
    updateStudent,
    archiveStudent,
    reactivateStudent,
    deleteStudent,
    refetch: fetchStudents,
  }
}

// Fetch a single student by ID
export function useStudent(id: string) {
  const [student, setStudent] = useState<StudentWithClass | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchStudent() {
      setLoading(true)
      const { data, error } = await supabase
        .from('students')
        .select('*, classes(name)')
        .eq('id', id)
        .single()

      if (error) setError(error.message)
      else setStudent(data as StudentWithClass)
      setLoading(false)
    }

    if (id) fetchStudent()
  }, [id])

  return { student, loading, error }
}
