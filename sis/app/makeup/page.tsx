'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMakeup } from '@/hooks/useMakeup'
import { useClasses } from '@/hooks/useClasses'
import { MakeupProgress } from '@/types'

const PROGRESS_LABELS: Record<MakeupProgress, string> = {
  scheduled: 'Scheduled',
  voca_retest: 'Voca Re-test',
  build_up_class: 'Build-up Class',
  complete: 'Complete',
  cancellation: 'Cancellation',
}

const PROGRESS_COLORS: Record<MakeupProgress, string> = {
  scheduled: 'bg-[#EEF2FF] text-[#3B5BDB]',
  voca_retest: 'bg-[#FEF3C7] text-[#D97706]',
  build_up_class: 'bg-[#F3E8FF] text-[#7C3AED]',
  complete: 'bg-[#DCFCE7] text-[#16A34A]',
  cancellation: 'bg-[#FEF2F2] text-[#DC2626]',
}

const PROGRESS_DOT: Record<MakeupProgress, string> = {
  scheduled: 'bg-[#3B5BDB]',
  voca_retest: 'bg-[#D97706]',
  build_up_class: 'bg-[#7C3AED]',
  complete: 'bg-[#16A34A]',
  cancellation: 'bg-[#DC2626]',
}

type ViewMode = 'list' | 'calendar'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function MakeupPage() {
  const [filterClassId, setFilterClassId] = useState('')
  const [filterProgress, setFilterProgress] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedMaterials, setExpandedMaterials] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [calendarDate, setCalendarDate] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const { makeupSchedules, loading } = useMakeup({
    classId: filterClassId || undefined,
    progress: filterProgress || undefined,
  })
  const { classes } = useClasses()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function toggleMaterials(id: string) {
    setExpandedMaterials(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function prevMonth() {
    setCalendarDate(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 }
      return { ...prev, month: prev.month - 1 }
    })
  }

  function nextMonth() {
    setCalendarDate(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 }
      return { ...prev, month: prev.month + 1 }
    })
  }

  // Parse class_time to get a sortable number (e.g. "4~" → 4, "3:30~" → 3.5)
  function parseTime(timeStr: string | null | undefined): number {
    if (!timeStr) return 99
    const cleaned = timeStr.replace('~', '').trim()
    if (cleaned.includes(':')) {
      const [h, m] = cleaned.split(':').map(Number)
      return h + (m || 0) / 60
    }
    return parseFloat(cleaned) || 99
  }

  const filtered = makeupSchedules.filter((m) => {
    if (!searchTerm) return true
    return m.students?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const hasFilters = filterClassId || filterProgress || searchTerm

  // Build calendar data
  const { year, month } = calendarDate
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Group makeup sessions by their makeup date for calendar view
  const sessionsByDate: Record<string, typeof makeupSchedules> = {}
  makeupSchedules.forEach(m => {
    if (!m.date_makeup) return
    if (!sessionsByDate[m.date_makeup]) sessionsByDate[m.date_makeup] = []
    sessionsByDate[m.date_makeup].push(m)
  })

  // Sort sessions within each day by class_time
  Object.keys(sessionsByDate).forEach(date => {
    sessionsByDate[date].sort((a, b) =>
      parseTime((a as any).class_time) - parseTime((b as any).class_time)
    )
  })

  return (
    <main className="min-h-screen bg-[#F0F4FF]">

      {/* Top Nav */}
      <nav className="bg-white border-b border-[#e5e7eb] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold text-[#1a1a2e] text-sm">Teacher Portal</span>
        </div>
        <button onClick={handleSignOut} className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors">Sign out</button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Page Title + View Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1a1a2e]">Makeup Schedule</h1>
            <p className="text-sm text-[#6b7280]">Manage makeup classes for absent students</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-white rounded-lg border border-[#e5e7eb] p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#3B5BDB] text-white'
                    : 'text-[#6b7280] hover:text-[#1a1a2e]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-[#3B5BDB] text-white'
                    : 'text-[#6b7280] hover:text-[#1a1a2e]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </button>
            </div>
            <button
              onClick={() => router.push('/makeup/new')}
              className="text-sm bg-[#3B5BDB] hover:bg-[#2f4ac4] text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + New
            </button>
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-5 gap-3">
            {(Object.keys(PROGRESS_LABELS) as MakeupProgress[]).map((p) => {
              const count = makeupSchedules.filter((m) => m.progress === p).length
              return (
                <div key={p} className="bg-white rounded-xl border border-[#e5e7eb] p-3 text-center">
                  <p className="text-xs text-[#6b7280] mb-1">{PROGRESS_LABELS[p]}</p>
                  <p className="text-xl font-bold text-[#1a1a2e]">{count}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* ── CALENDAR VIEW ── */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">

            {/* Calendar header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-[#F0F4FF] transition-colors"
              >
                <svg className="w-4 h-4 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-sm font-semibold text-[#1a1a2e]">
                {MONTH_NAMES[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-[#F0F4FF] transition-colors"
              >
                <svg className="w-4 h-4 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-[#e5e7eb]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2 text-center text-xs font-medium text-[#6b7280]">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-[#e5e7eb] bg-[#FAFAFA]" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const sessions = sessionsByDate[dateStr] ?? []
                const today = new Date()
                const isToday =
                  today.getFullYear() === year &&
                  today.getMonth() === month &&
                  today.getDate() === day

                return (
                  <div
                    key={day}
                    className={`min-h-[100px] border-b border-r border-[#e5e7eb] p-1.5 ${
                      isToday ? 'bg-[#F0F4FF]' : ''
                    }`}
                  >
                    {/* Day number */}
                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-[#3B5BDB] text-white'
                        : 'text-[#6b7280]'
                    }`}>
                      {day}
                    </div>

                    {/* Sessions */}
                    <div className="space-y-1">
                      {sessions.map(s => (
                        <button
                          key={s.id}
                          onClick={() => router.push(`/makeup/${s.id}`)}
                          className="w-full text-left"
                        >
                          <div className={`rounded px-1.5 py-0.5 flex items-center gap-1 hover:opacity-80 transition-opacity ${PROGRESS_COLORS[s.progress]}`}>
                            <span className="text-[10px] font-medium truncate flex-1">
                              {(s as any).class_time && (
                                <span className="opacity-70">{(s as any).class_time} </span>
                              )}
                              {s.students?.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="px-5 py-3 border-t border-[#e5e7eb] flex flex-wrap gap-3">
              {(Object.keys(PROGRESS_LABELS) as MakeupProgress[]).map(p => (
                <div key={p} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${PROGRESS_DOT[p]}`} />
                  <span className="text-xs text-[#6b7280]">{PROGRESS_LABELS[p]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {viewMode === 'list' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1a1a2e]">Filters</h2>
                {hasFilters && (
                  <button
                    onClick={() => { setFilterClassId(''); setFilterProgress(''); setSearchTerm('') }}
                    className="text-xs text-[#3B5BDB] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student name..."
                  className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                />
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
                <select
                  value={filterProgress}
                  onChange={(e) => setFilterProgress(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-white"
                >
                  <option value="">All statuses</option>
                  {(Object.keys(PROGRESS_LABELS) as MakeupProgress[]).map((p) => (
                    <option key={p} value={p}>{PROGRESS_LABELS[p]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Makeup List */}
            <div>
              <h2 className="text-sm font-semibold text-[#1a1a2e] mb-3">
                Makeup Sessions
                <span className="text-[#6b7280] font-normal ml-1">({filtered.length})</span>
              </h2>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-4 animate-pulse h-20" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
                  <p className="text-sm text-[#6b7280]">
                    {makeupSchedules.length === 0
                      ? 'No makeup sessions yet.'
                      : 'No sessions match your filters.'}
                  </p>
                  {makeupSchedules.length === 0 && (
                    <button
                      onClick={() => router.push('/makeup/new')}
                      className="mt-3 text-sm text-[#3B5BDB] hover:underline"
                    >
                      Schedule the first one
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((m) => {
                    const isExpanded = expandedMaterials[m.id]
                    const materials = m.textbook_materials
                    return (
                      <div key={m.id} className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1a1a2e] truncate">
                              {m.students?.name}
                            </p>
                            <p className="text-xs text-[#6b7280] truncate">
                              Class {m.classes?.name}
                              {m.date_absent && ` · Absent ${m.date_absent}`}
                              {m.date_makeup && ` · Makeup ${m.date_makeup}`}
                              {(m as any).class_time && ` · ${(m as any).class_time}`}
                              {` · ${m.teachers?.name}`}
                            </p>
                            {materials && (
                              <button
                                onClick={() => toggleMaterials(m.id)}
                                className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#3B5BDB] transition-colors mt-0.5"
                              >
                                <span>📚</span>
                                <span className={isExpanded ? '' : 'truncate max-w-[200px]'}>
                                  {isExpanded ? 'Hide materials' : materials}
                                </span>
                                <span className="flex-shrink-0">{isExpanded ? '▲' : '▼'}</span>
                              </button>
                            )}
                          </div>
                          <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${PROGRESS_COLORS[m.progress]}`}>
                            {PROGRESS_LABELS[m.progress]}
                          </span>
                          <button
                            onClick={() => router.push(`/makeup/${m.id}`)}
                            className="flex-shrink-0 text-xs text-[#6b7280] hover:text-[#3B5BDB] transition-colors"
                          >
                            View →
                          </button>
                        </div>
                        {isExpanded && materials && (
                          <div className="bg-[#F8FAFF] border border-[#c7d2fe] rounded-lg px-3 py-2 text-xs text-[#374151] leading-relaxed whitespace-pre-wrap">
                            {materials}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
