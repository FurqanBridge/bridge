import { createClient } from '@/lib/supabase/client'
import { Student, NewStudent, StudentWithClass } from '@/types'
import { useState, useEffect } from 'react'

export function useStudents(classId?: string) {
  const [students, setStudents] = useState<StudentWithClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch students — optionally filtered by class
  async function fetchStudents() {
    setLoading(true)

    let query = supabase
      .from('students')
      .select('*, classes(name)')
      .order('korean_name')

    if (classId) query = query.eq('class_id', classId)

    const { data, error } = await query

    if (error) setError(error.message)
    else setStudents((data as StudentWithClass[]) ?? [])
    setLoading(false)
  }

  // Add a new student
  async function addStudent(newStudent: NewStudent): Promise<boolean> {
    const { error } = await supabase.from('students').insert(newStudent)
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

  // Delete a student
  async function deleteStudent(id: string): Promise<boolean> {
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchStudents()
    return true
  }

  useEffect(() => { fetchStudents() }, [classId])

  return { students, loading, error, addStudent, updateStudent, deleteStudent, refetch: fetchStudents }
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
