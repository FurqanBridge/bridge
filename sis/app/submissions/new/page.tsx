'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useClasses } from '@/hooks/useClasses'
import { useStudents } from '@/hooks/useStudents'
import { useStorytelling } from '@/hooks/useStorytelling'
import { useSubmissions } from '@/hooks/useSubmissions'
import { uploadAttachment } from '@/lib/supabase/storage'

export default function NewSubmissionPage() {
  const { classes } = useClasses()
  const [selectedClassId, setSelectedClassId] = useState('')
  const { students } = useStudents(selectedClassId || undefined)
  const { storytelling } = useStorytelling(selectedClassId || undefined)
  const { addSubmission } = useSubmissions()

  const [studentId, setStudentId] = useState('')
  const [storytellingId, setStorytellingId] = useState('')
  const [dateSubmitted, setDateSubmitted] = useState('')
  const [url1, setUrl1] = useState('')
  const [url2, setUrl2] = useState('')
  const [url3, setUrl3] = useState('')
  const [attachment1, setAttachment1] = useState<File | null>(null)
  const [attachment2, setAttachment2] = useState<File | null>(null)
  const [attachment3, setAttachment3] = useState<File | null>(null)
  const [preview1, setPreview1] = useState<string | null>(null)
  const [preview2, setPreview2] = useState<string | null>(null)
  const [preview3, setPreview3] = useState<string | null>(null)
  const [advantages, setAdvantages] = useState('')
  const [disadvantages, setDisadvantages] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  // Clean up object URLs on unmount or change
  useEffect(() => {
    return () => {
      if (preview1) URL.revokeObjectURL(preview1)
      if (preview2) URL.revokeObjectURL(preview2)
      if (preview3) URL.revokeObjectURL(preview3)
    }
  }, [preview1, preview2, preview3])

  function handleFileSelect(file: File | null, slot: 1 | 2 | 3) {
    if (slot === 1) {
      setAttachment1(file)
      setPreview1(file ? URL.createObjectURL(file) : null)
    } else if (slot === 2) {
      setAttachment2(file)
      setPreview2(file ? URL.createObjectURL(file) : null)
    } else {
      setAttachment3(file)
      setPreview3(file ? URL.createObjectURL(file) : null)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleSubmit() {
    if (!studentId || !storytellingId || !dateSubmitted) {
      setError('Please fill in the student, storytelling entry, and date.')
      return
    }

    setSubmitting(true)
    setError(null)

    // Create the submission first to get the ID for storage paths
    const tempId = crypto.randomUUID()

    // Upload attachments if provided
    let attachmentUrl1 = null
    let attachmentUrl2 = null
    let attachmentUrl3 = null

    if (attachment1) attachmentUrl1 = await uploadAttachment(attachment1, tempId, 1)
    if (attachment2) attachmentUrl2 = await uploadAttachment(attachment2, tempId, 2)
    if (attachment3) attachmentUrl3 = await uploadAttachment(attachment3, tempId, 3)

    const success = await addSubmission({
      student_id: studentId,
      storytelling_id: storytellingId,
      date_submitted: dateSubmitted,
      url_1: url1 || null,
      url_2: url2 || null,
      url_3: url3 || null,
      attachment_1: attachmentUrl1,
      attachment_2: attachmentUrl2,
      attachment_3: attachmentUrl3,
      advantages: advantages || null,
      disadvantages: disadvantages || null,
    })

    if (!success) {
      setError('Could not save submission. This student may already have a submission for this storytelling entry.')
      setSubmitting(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#F0F4FF]">

      {/* Top Nav */}
      <nav className="bg-white border-b border-[#e5e7eb] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
          >
            ← Dashboard
          </button>
          <span className="text-[#d1d5db]">|</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <span className="font-semibold text-[#1a1a2e] text-sm">Teacher Portal</span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
        >
          Sign out
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Page Title */}
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">New Submission</h1>
          <p className="text-sm text-[#6b7280]">Log a student's homework submission</p>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 space-y-5">

          {/* Class selector */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => { setSelectedClassId(e.target.value); setStudentId(''); setStorytellingId('') }}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-white"
            >
              <option value="">Select a class first</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>Class {c.name}</option>
              ))}
            </select>
          </div>

          {/* Student selector */}
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

          {/* Storytelling selector */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">Storytelling</label>
            <select
              value={storytellingId}
              onChange={(e) => setStorytellingId(e.target.value)}
              disabled={!selectedClassId}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-white disabled:opacity-50"
            >
              <option value="">Select a storytelling entry</option>
              {storytelling.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Date submitted */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">Date Submitted</label>
            <input
              type="date"
              value={dateSubmitted}
              onChange={(e) => setDateSubmitted(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
            />
          </div>

          {/* Divider */}
          <hr className="border-[#e5e7eb]" />

          {/* URLs */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#374151]">Homework Links <span className="text-[#9ca3af] font-normal">(optional)</span></label>
            {[
              { val: url1, set: setUrl1, label: 'Link 1' },
              { val: url2, set: setUrl2, label: 'Link 2' },
              { val: url3, set: setUrl3, label: 'Link 3' },
            ].map(({ val, set, label }) => (
              <input
                key={label}
                type="url"
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={`https://... (${label})`}
                className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
              />
            ))}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#374151]">Attachments <span className="text-[#9ca3af] font-normal">(optional, images only)</span></label>
            {[
              { preview: preview1, slot: 1 as const, label: 'Attachment 1' },
              { preview: preview2, slot: 2 as const, label: 'Attachment 2' },
              { preview: preview3, slot: 3 as const, label: 'Attachment 3' },
            ].map(({ preview, slot, label }) => (
              <div key={label} className="space-y-1">
                {preview && (
                  <div className="flex items-center gap-2">
                    <img src={preview} alt={label} className="w-16 h-16 object-cover rounded-lg border border-[#e5e7eb]" />
                    <button
                      type="button"
                      onClick={() => handleFileSelect(null, slot)}
                      className="text-xs text-[#DC2626] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#d1d5db] text-sm text-[#6b7280] cursor-pointer hover:border-[#3B5BDB] hover:text-[#3B5BDB] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {preview ? `Replace ${label}` : `Upload ${label}`}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null, slot)}
                  />
                </label>
              </div>
            ))}
          </div>

          {/* Divider */}
          <hr className="border-[#e5e7eb]" />

          {/* Advantages */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">Advantages <span className="text-[#9ca3af] font-normal">(optional)</span></label>
            <textarea
              value={advantages}
              onChange={(e) => setAdvantages(e.target.value)}
              placeholder="What did the student do well?"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] resize-none"
            />
          </div>

          {/* Disadvantages */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">Disadvantages <span className="text-[#9ca3af] font-normal">(optional)</span></label>
            <textarea
              value={disadvantages}
              onChange={(e) => setDisadvantages(e.target.value)}
              placeholder="What could the student improve?"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !studentId || !storytellingId || !dateSubmitted}
            className="w-full bg-[#3B5BDB] hover:bg-[#2f4ac4] disabled:bg-[#93a3e8] text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
          >
            {submitting ? 'Saving...' : 'Save submission'}
          </button>
        </div>
      </div>
    </main>
  )
}
