'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSingleMakeup, useMakeup } from '@/hooks/useMakeup'
import { useTeachers } from '@/hooks/useTeachers'
import { MakeupProgress } from '@/types'

const PROGRESS_OPTIONS: { value: MakeupProgress; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'voca_retest', label: 'Voca Re-test' },
  { value: 'build_up_class', label: 'Build-up Class' },
  { value: 'complete', label: 'Complete' },
  { value: 'cancellation', label: 'Cancellation' },
]

const PROGRESS_COLORS: Record<MakeupProgress, string> = {
  scheduled: 'bg-[#EEF2FF] text-[#3B5BDB]',
  voca_retest: 'bg-[#FEF3C7] text-[#D97706]',
  build_up_class: 'bg-[#F3E8FF] text-[#7C3AED]',
  complete: 'bg-[#DCFCE7] text-[#16A34A]',
  cancellation: 'bg-[#FEF2F2] text-[#DC2626]',
}

export default function MakeupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { makeup, loading } = useSingleMakeup(id)
  const { updateMakeup, deleteMakeup } = useMakeup()
  const { teachers } = useTeachers()
  const router = useRouter()
  const supabase = createClient()

  const [teacherId, setTeacherId] = useState('')
  const [dateAbsent, setDateAbsent] = useState('')
  const [dateMakeup, setDateMakeup] = useState('')
  const [classTime, setClassTime] = useState('')
  const [progress, setProgress] = useState<MakeupProgress>('scheduled')
  const [textbookMaterials, setTextbookMaterials] = useState('')
  const [reasonForAbsence, setReasonForAbsence] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (makeup) {
      setTeacherId(makeup.teacher_id)
      setDateAbsent(makeup.date_absent ?? '')
      setDateMakeup(makeup.date_makeup ?? '')
      setClassTime((makeup as any).class_time ?? '')
      setProgress(makeup.progress)
      setTextbookMaterials(makeup.textbook_materials ?? '')
      setReasonForAbsence(makeup.reason_for_absence ?? '')
    }
  }, [makeup])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    const success = await updateMakeup(id, {
      teacher_id: teacherId,
      date_absent: dateAbsent || null,
      date_makeup: dateMakeup || null,
      class_time: classTime || null,
      progress,
      textbook_materials: textbookMaterials || null,
      reason_for_absence: reasonForAbsence || null,
    } as any)

    if (!success) setError('Could not save changes. Please try again.')
    else setSaved(true)

    setSaving(false)
  }

  async function handleDelete() {
    if (!makeup) return
    const confirmed = confirm(`Delete this makeup session for ${makeup.students?.name}? This cannot be undone.`)
    if (!confirmed) return

    setDeleting(true)
    const success = await deleteMakeup(id)
    if (!success) {
      setError('Could not delete. Please try again.')
      setDeleting(false)
      return
    }
    router.push('/makeup')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <p className="text-sm text-[#6b7280]">Loading...</p>
      </main>
    )
  }

  if (!makeup) {
    return (
      <main className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <p className="text-sm text-[#6b7280]">Makeup session not found.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F0F4FF]">

      {/* Top Nav */}
      <nav className="bg-white border-b border-[#e5e7eb] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/makeup')} className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors">← Makeup</button>
          <span className="text-[#d1d5db]">|</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-[#1a1a2e] text-sm">Teacher Portal</span>
          </div>
        </div>
        <button onClick={handleSignOut} className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors">Sign out</button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1a1a2e]">{makeup.students?.name}</h1>
            <p className="text-sm text-[#6b7280]">Class {makeup.classes?.name}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PROGRESS_COLORS[progress]}`}>
            {PROGRESS_OPTIONS.find(p => p.value === progress)?.label}
          </span>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-[#DCFCE7] border border-[#86EFAC] text-[#16A34A] text-sm rounded-lg px-4 py-3">
            Changes saved successfully.
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 space-y-4">

          {/* Teacher */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[#374151]">Teacher</label>
              <button onClick={() => router.push('/teachers')} className="text-xs text-[#3B5BDB] hover:underline">
                Manage teachers →
              </button>
            </div>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-white"
            >
              <option value="">Select a teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#374151]">
                Date Absent <span className="text-[#9ca3af] font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={dateAbsent}
                onChange={(e) => setDateAbsent(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#374151]">
                Date of Makeup <span className="text-[#9ca3af] font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={dateMakeup}
                onChange={(e) => setDateMakeup(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
              />
            </div>
          </div>

          {/* Class Time */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">
              Class Time <span className="text-[#9ca3af] font-normal">(optional, e.g. 4~, 3:30~)</span>
            </label>
            <input
              type="text"
              value={classTime}
              onChange={(e) => setClassTime(e.target.value)}
              placeholder="e.g. 4~"
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
            />
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">Progress</label>
            <div className="flex flex-wrap gap-2">
              {PROGRESS_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setProgress(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    progress === p.value
                      ? `${PROGRESS_COLORS[p.value]} border-current`
                      : 'bg-white text-[#6b7280] border-[#d1d5db] hover:border-[#3B5BDB]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-[#e5e7eb]" />

          {/* Textbook/Materials */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">
              Textbook / Materials <span className="text-[#9ca3af] font-normal">(optional)</span>
            </label>
            <textarea
              value={textbookMaterials}
              onChange={(e) => setTextbookMaterials(e.target.value)}
              placeholder="e.g. Student Book p.24, Workbook Unit 3"
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] resize-none"
            />
          </div>

          {/* Reason for Absence */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">
              Reason for Absence <span className="text-[#9ca3af] font-normal">(optional)</span>
            </label>
            <textarea
              value={reasonForAbsence}
              onChange={(e) => setReasonForAbsence(e.target.value)}
              placeholder="e.g. Sick, family trip, school event"
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] resize-none"
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#3B5BDB] hover:bg-[#2f4ac4] disabled:bg-[#93a3e8] text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>

        {/* Delete */}
        <div className="bg-white rounded-xl border border-[#FECACA] p-5 space-y-2">
          <h2 className="text-sm font-semibold text-[#DC2626]">Delete this session</h2>
          <p className="text-xs text-[#6b7280]">This will permanently remove this makeup session and cannot be undone.</p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full bg-white border border-[#DC2626] hover:bg-[#FEF2F2] disabled:opacity-50 text-[#DC2626] font-medium text-sm py-2.5 rounded-lg transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete session'}
          </button>
        </div>
      </div>
    </main>
  )
}
