'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SubmissionWithDetails, StorytellingProgress } from '@/types'
import { useClasses } from '@/hooks/useClasses'
import StatusCircle from '@/components/StatusCircle'
import { PROGRESS_BADGE, PROGRESS_LABEL, isDone, saveProgress } from '@/lib/progress'

type CheckedFilter = 'all' | 'checked' | 'pass' | 'pending'

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [loading, setLoading] = useState(true)

  const [filterClassId, setFilterClassId] = useState('')
  const [filterChecked, setFilterChecked] = useState<CheckedFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { classes } = useClasses()
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
          students(name, class_id),
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

  async function changeProgress(id: string, next: StorytellingProgress) {
    const ok = await saveProgress(supabase, id, next)
    if (!ok) return
    setSubmissions((prev) =>
      prev.map((s) => s.id === id ? { ...s, progress: next, is_checked: isDone(next) } : s)
    )
  }

  // "Pass" counts together with "Checked"
  const pendingCount = submissions.filter((s) => s.progress === 'pending').length
  const checkedCount = submissions.filter((s) => isDone(s.progress)).length

  // Apply filters
  const filteredSubmissions = submissions.filter((s) => {
    if (filterClassId && (s.students as any)?.class_id !== filterClassId) return false
    if (filterChecked === 'checked' && s.progress !== 'checked') return false
    if (filterChecked === 'pass' && s.progress !== 'pass') return false
    if (filterChecked === 'pending' && s.progress !== 'pending') return false
    if (searchTerm && !s.students?.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const hasActiveFilters = filterClassId || filterChecked !== 'all' || searchTerm

  function clearFilters() {
    setFilterClassId('')
    setFilterChecked('all')
    setSearchTerm('')
  }

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

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1a1a2e]">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#3B5BDB] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Search by student name */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student name..."
              className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
            />

            {/* Class filter */}
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-white"
            >
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>Class {c.name}</option>
              ))}
            </select>

            {/* Checked status filter */}
            <select
              value={filterChecked}
              onChange={(e) => setFilterChecked(e.target.value as CheckedFilter)}
              className="px-3 py-2 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-white"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending only</option>
              <option value="checked">Checked only</option>
              <option value="pass">Pass only</option>
            </select>
          </div>
        </div>

        {/* Submissions List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#1a1a2e]">
              Submissions
              <span className="text-[#6b7280] font-normal ml-1">
                ({filteredSubmissions.length})
              </span>
            </h2>
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
          ) : filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
              <p className="text-sm text-[#6b7280]">
                {submissions.length === 0
                  ? 'No submissions yet.'
                  : 'No submissions match your filters.'}
              </p>
              {submissions.length === 0 ? (
                <button
                  onClick={() => router.push('/submissions/new')}
                  className="mt-3 text-sm text-[#3B5BDB] hover:underline"
                >
                  Log the first one
                </button>
              ) : (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-sm text-[#3B5BDB] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSubmissions.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 flex items-center gap-3"
                >
                  {/* Status circle: click toggles, double-click = Pass */}
                  <StatusCircle
                    progress={s.progress}
                    onChange={(next) => changeProgress(s.id, next)}
                  />

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
