'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useStudent } from '@/hooks/useStudents'
import { SubmissionWithDetails, StorytellingProgress } from '@/types'
import StatusCircle from '@/components/StatusCircle'
import { PROGRESS_BADGE, PROGRESS_LABEL, isDone, saveProgress } from '@/lib/progress'

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { student, loading: studentLoading } = useStudent(id)
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchSubmissions() {
      setLoading(true)
      const { data } = await supabase
        .from('submissions')
        .select(`
          *,
          students(name),
          storytelling(name, classes(name))
        `)
        .eq('student_id', id)
        .order('date_submitted', { ascending: false })

      setSubmissions((data as SubmissionWithDetails[]) ?? [])
      setLoading(false)
    }

    if (id) fetchSubmissions()
  }, [id])

  async function changeProgress(submissionId: string, next: StorytellingProgress) {
    const ok = await saveProgress(supabase, submissionId, next)
    if (!ok) return
    setSubmissions((prev) =>
      prev.map((s) => s.id === submissionId ? { ...s, progress: next, is_checked: isDone(next) } : s)
    )
  }

  // "Pass" counts together with "Checked"
  const checkedCount = submissions.filter((s) => isDone(s.progress)).length
  const pendingCount = submissions.filter((s) => s.progress === 'pending').length

  if (studentLoading) {
    return (
      <main className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <p className="text-sm text-[#6b7280]">Loading...</p>
      </main>
    )
  }

  if (!student) {
    return (
      <main className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <p className="text-sm text-[#6b7280]">Student not found.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F0F4FF]">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => router.push('/students')}
              className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors mb-2 block"
            >
              ← Students
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                <span className="text-sm font-bold text-[#3B5BDB]">
                  {student.name[0]}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a1a2e]">{student.name}</h1>
                <p className="text-sm text-[#6b7280]">Class {student.classes?.name}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/submissions/new')}
            className="text-xs bg-[#3B5BDB] hover:bg-[#2f4ac4] text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            + New submission
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-[#e5e7eb]">
            <p className="text-xs text-[#6b7280] uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-[#1a1a2e] mt-1">{submissions.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#e5e7eb]">
            <p className="text-xs text-[#6b7280] uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-[#DC2626] mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#e5e7eb]">
            <p className="text-xs text-[#6b7280] uppercase tracking-wide">Checked</p>
            <p className="text-2xl font-bold text-[#16A34A] mt-1">{checkedCount}</p>
          </div>
        </div>

        {/* Submissions List */}
        <div>
          <h2 className="text-sm font-semibold text-[#1a1a2e] mb-3">Submissions</h2>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-4 animate-pulse h-16" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
              <p className="text-sm text-[#6b7280]">No submissions yet for this student.</p>
              <button
                onClick={() => router.push('/submissions/new')}
                className="mt-3 text-sm text-[#3B5BDB] hover:underline"
              >
                Log the first one
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 flex items-center gap-3"
                >
                  <StatusCircle
                    progress={s.progress}
                    onChange={(next) => changeProgress(s.id, next)}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a2e] truncate">
                      {s.storytelling?.name}
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      Class {s.storytelling?.classes?.name} · Submitted {s.date_submitted}
                    </p>
                  </div>

                  <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${PROGRESS_BADGE[s.progress]}`}>
                    {PROGRESS_LABEL[s.progress]}
                  </span>

                  {/* View button */}
                  <button
                    onClick={() => router.push(`/submissions/${s.id}`)}
                    className="flex-shrink-0 text-xs text-[#6b7280] hover:text-[#3B5BDB] transition-colors"
                  >
                    View →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
