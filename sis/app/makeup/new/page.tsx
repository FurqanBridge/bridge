'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMakeup } from '@/hooks/useMakeup'
import { useClasses } from '@/hooks/useClasses'
import { useStudents } from '@/hooks/useStudents'
import { useTeachers } from '@/hooks/useTeachers'
import { MakeupProgress } from '@/types'

const PROGRESS_OPTIONS: { value: MakeupProgress; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'voca_retest', label: 'Voca Re-test' },
  { value: 'build_up_class', label: 'Build-up Class' },
  { value: 'complete', label: 'Complete' },
  { value: 'cancellation', label: 'Cancellation' },
]

export default function NewMakeupPage() {
  const [selectedClassId, setSelectedClassId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [dateAbsent, setDateAbsent] = useState('')
  const [dateMakeup, setDateMakeup] = useState('')
  const [classTime, setClassTime] = useState('')
  const [progress, setProgress] = useState<MakeupProgress>('scheduled')
  const [textbookMaterials, setTextbookMaterials] = useState('')
  const [reasonForAbsence, setReasonForAbsence] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { classes } = useClasses()
  const { students } = useStudents(selectedClassId || undefined)
  const { teachers } = useTeachers()
  const { addMakeup } = useMakeup()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleSubmit() {
    if (!selectedClassId || !studentId || !teacherId) {
      setError('Please fill in class, student, and teacher.')
      return
    }

    setSubmitting(true)
    setError(null)

    const success = await addMakeup({
      student_id: studentId,
      class_id: selectedClassId,
      teacher_id: teacherId,
      date_absent: dateAbsent || null,
      date_makeup: dateMakeup || null,
      class_time: classTime || null,
      progress,
      textbook_materials: textbookMaterials || null,
      reason_for_absence: reasonForAbsence || null,
    })

    if (!success) {
      setError('Could not save makeup session. Please try again.')
      setSubmitting(false)
      return
    }

    router.push('/makeup')
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

        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">New Makeup Session</h1>
          <p className="text-sm text-[#6b7280]">Schedule a makeup class for an absent student</p>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 space-y-4">

          {/* Class */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => { setSelectedClassId(e.target.value); setStudentId('') }}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-white"
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>Class {c.name}</option>
              ))}
            </select>
          </div>

          {/* Student */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">Student</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={!selectedClassId}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-white disabled:opacity-50"
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Teacher */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[#374151]">Teacher</label>
              <button
                onClick={() => router.push('/teachers')}
                className="text-xs text-[#3B5BDB] hover:underline"
              >
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

          <hr className="border-[#e5e7eb]" />

          {/* Dates + Time */}
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
            <select
              value={progress}
              onChange={(e) => setProgress(e.target.value as MakeupProgress)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-white"
            >
              {PROGRESS_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
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

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedClassId || !studentId || !teacherId}
            className="w-full bg-[#3B5BDB] hover:bg-[#2f4ac4] disabled:bg-[#93a3e8] text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
          >
            {submitting ? 'Saving...' : 'Save makeup session'}
          </button>
        </div>
      </div>
    </main>
  )
}
