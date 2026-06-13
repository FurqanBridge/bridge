'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SubmissionWithDetails } from '@/types'
import { useSingleStorytelling } from '@/hooks/useStorytelling'

export default function StorytellingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { storytelling, loading: storyLoading } = useSingleStorytelling(id)
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
        .eq('storytelling_id', id)
        .order('date_submitted', { ascending: false })

      setSubmissions((data as SubmissionWithDetails[]) ?? [])
      setLoading(false)
    }

    if (id) fetchSubmissions()
  }, [id])

  async function toggleChecked(submissionId: string, current: boolean) {
    await supabase
      .from('submissions')
      .update({ is_checked: !current })
      .eq('id', submissionId)

    setSubmissions((prev) =>
      prev.map((s) => s.id === submissionId ? { ...s, is_checked: !current } : s)
    )
  }

  const checkedCount = submissions.filter((s) => s.is_checked).length
  const pendingCount = submissions.filter((s) => !s.is_checked).length

  if (storyLoading) {
    return (
      <main className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <p className="text-sm text-[#6b7280]">Loading...</p>
      </main>
    )
  }

  if (!storytelling) {
    return (
      <main className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <p className="text-sm text-[#6b7280]">Storytelling entry not found.</p>
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
              onClick={() => router.push('/storytelling')}
              className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors mb-2 block"
            >
              ← Storytelling
            </button>
            <h1 className="text-xl font-bold text-[#1a1a2e]">{storytelling.name}</h1>
            <p className="text-sm text-[#6b7280]">Class {storytelling.classes?.name}</p>
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
              <p className="text-sm text-[#6b7280]">No submissions yet for this storytelling entry.</p>
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
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleChecked(s.id, s.is_checked)}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      s.is_checked
                        ? 'bg-[#16A34A] border-[#16A34A]'
                        : 'border-[#d1d5db] hover:border-[#3B5BDB]'
                    }`}
                  >
                    {s.is_checked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a2e] truncate">
                      {s.students?.name}
                    </p>
                    <p className="text-xs text-[#6b7280]">Submitted {s.date_submitted}</p>
                  </div>

                  {/* Status badge */}
                  <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                    s.is_checked
                      ? 'bg-[#DCFCE7] text-[#16A34A]'
                      : 'bg-[#FEF2F2] text-[#DC2626]'
                  }`}>
                    {s.is_checked ? 'Checked' : 'Pending'}
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
