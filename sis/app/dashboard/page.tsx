'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SubmissionWithDetails } from '@/types'

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // Fetch all submissions with related data
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select(`
          *,
          students(name),
          storytelling(name, classes(name))
        `)
        .order('date_submitted', { ascending: false })

      // Fetch total student count
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })

      setSubmissions((submissionsData as SubmissionWithDetails[]) ?? [])
      setTotalStudents(count ?? 0)
      setLoading(false)
    }

    fetchData()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function toggleChecked(id: string, current: boolean) {
    await supabase
      .from('submissions')
      .update({ is_checked: !current })
      .eq('id', id)

    setSubmissions((prev) =>
      prev.map((s) => s.id === id ? { ...s, is_checked: !current } : s)
    )
  }

  const pendingCount = submissions.filter((s) => !s.is_checked).length
  const checkedCount = submissions.filter((s) => s.is_checked).length

  return (
    <main className="min-h-screen bg-[#F0F4FF]">

      {/* Top Nav */}
      <nav className="bg-white border-b border-[#e5e7eb] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <span className="font-semibold text-[#1a1a2e] text-sm">Teacher Portal</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
        >
          Sign out
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Page Title */}
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">Dashboard</h1>
          <p className="text-sm text-[#6b7280]">Overview of all student submissions</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-[#e5e7eb] animate-pulse h-20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-[#e5e7eb]">
              <p className="text-xs text-[#6b7280] uppercase tracking-wide">Students</p>
              <p className="text-2xl font-bold text-[#1a1a2e] mt-1">{totalStudents}</p>
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
        )}

        {/* Submissions List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#1a1a2e]">All Submissions</h2>
            <button
              onClick={() => router.push('/submissions/new')}
              className="text-xs bg-[#3B5BDB] hover:bg-[#2f4ac4] text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              + New submission
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-[#e5e7eb] animate-pulse h-16" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
              <p className="text-sm text-[#6b7280]">No submissions yet.</p>
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
                    <p className="text-xs text-[#6b7280] truncate">
                      {s.storytelling?.name} · Class {s.storytelling?.classes?.name} · {s.date_submitted}
                    </p>
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
