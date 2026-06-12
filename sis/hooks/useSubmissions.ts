import { createClient } from '@/lib/supabase/client'
import { NewSubmission, UpdateSubmission, SubmissionWithDetails } from '@/types'
import { useState, useEffect } from 'react'

interface SubmissionFilters {
  studentId?: string
  storytellingId?: string
  classId?: string
  isChecked?: boolean
}

export function useSubmissions(filters: SubmissionFilters = {}) {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch submissions with optional filters
  async function fetchSubmissions() {
    setLoading(true)

    let query = supabase
      .from('submissions')
      .select(`
        *,
        students(english_name, korean_name),
        storytelling(name, classes(name))
      `)
      .order('date_submitted', { ascending: false })

    if (filters.studentId) query = query.eq('student_id', filters.studentId)
    if (filters.storytellingId) query = query.eq('storytelling_id', filters.storytellingId)
    if (filters.isChecked !== undefined) query = query.eq('is_checked', filters.isChecked)

    const { data, error } = await query

    if (error) setError(error.message)
    else setSubmissions((data as SubmissionWithDetails[]) ?? [])
    setLoading(false)
  }

  // Add a new submission
  async function addSubmission(newSubmission: NewSubmission): Promise<boolean> {
    const { error } = await supabase.from('submissions').insert(newSubmission)
    if (error) { setError(error.message); return false }
    await fetchSubmissions()
    return true
  }

  // Update a submission (urls, attachments, notes, checked status)
  async function updateSubmission(id: string, updates: UpdateSubmission): Promise<boolean> {
    const { error } = await supabase.from('submissions').update(updates).eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchSubmissions()
    return true
  }

  // Toggle the checked status
  async function toggleChecked(id: string, currentStatus: boolean): Promise<boolean> {
    return updateSubmission(id, { is_checked: !currentStatus })
  }

  // Delete a submission
  async function deleteSubmission(id: string): Promise<boolean> {
    const { error } = await supabase.from('submissions').delete().eq('id', id)
    if (error) { setError(error.message); return false }
    await fetchSubmissions()
    return true
  }

  useEffect(() => {
    fetchSubmissions()
  }, [filters.studentId, filters.storytellingId, filters.classId, filters.isChecked])

  return {
    submissions,
    loading,
    error,
    addSubmission,
    updateSubmission,
    toggleChecked,
    deleteSubmission,
    refetch: fetchSubmissions
  }
}

// Fetch a single submission by ID
export function useSubmission(id: string) {
  const [submission, setSubmission] = useState<SubmissionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchSubmission() {
      setLoading(true)
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          students(english_name, korean_name),
          storytelling(name, classes(name))
        `)
        .eq('id', id)
        .single()

      if (error) setError(error.message)
      else setSubmission(data as SubmissionWithDetails)
      setLoading(false)
    }

    if (id) fetchSubmission()
  }, [id])

  return { submission, loading, error }
}
