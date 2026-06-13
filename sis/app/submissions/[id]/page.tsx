'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSubmission } from '@/hooks/useSubmissions'
import { uploadAttachment } from '@/lib/supabase/storage'

export default function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { submission, loading } = useSubmission(id)
  const router = useRouter()
  const supabase = createClient()

  const [url1, setUrl1] = useState('')
  const [url2, setUrl2] = useState('')
  const [url3, setUrl3] = useState('')
  const [advantages, setAdvantages] = useState('')
  const [disadvantages, setDisadvantages] = useState('')
  const [isChecked, setIsChecked] = useState(false)
  const [attachment1, setAttachment1] = useState<File | null>(null)
  const [attachment2, setAttachment2] = useState<File | null>(null)
  const [attachment3, setAttachment3] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate fields once submission loads
  useEffect(() => {
    if (submission) {
      setUrl1(submission.url_1 ?? '')
      setUrl2(submission.url_2 ?? '')
      setUrl3(submission.url_3 ?? '')
      setAdvantages(submission.advantages ?? '')
      setDisadvantages(submission.disadvantages ?? '')
      setIsChecked(submission.is_checked)
    }
  }, [submission])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleSave() {
    if (!submission) return
    setSaving(true)
    setError(null)
    setSaved(false)

    // Upload any new attachments
    let attachmentUrl1 = submission.attachment_1
    let attachmentUrl2 = submission.attachment_2
    let attachmentUrl3 = submission.attachment_3

    if (attachment1) attachmentUrl1 = await uploadAttachment(attachment1, submission.id, 1)
    if (attachment2) attachmentUrl2 = await uploadAttachment(attachment2, submission.id, 2)
    if (attachment3) attachmentUrl3 = await uploadAttachment(attachment3, submission.id, 3)

    const { error } = await supabase
      .from('submissions')
      .update({
        url_1: url1 || null,
        url_2: url2 || null,
        url_3: url3 || null,
        attachment_1: attachmentUrl1,
        attachment_2: attachmentUrl2,
        attachment_3: attachmentUrl3,
        advantages: advantages || null,
        disadvantages: disadvantages || null,
        is_checked: isChecked,
      })
      .eq('id', id)

    if (error) setError('Could not save changes. Please try again.')
    else setSaved(true)

    setSaving(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <p className="text-sm text-[#6b7280]">Loading...</p>
      </main>
    )
  }

  if (!submission) {
    return (
      <main className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <p className="text-sm text-[#6b7280]">Submission not found.</p>
      </main>
    )
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

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1a1a2e]">
              {submission.students?.name}
            </h1>
            <p className="text-sm text-[#6b7280]">
              {submission.storytelling?.name} · Class {submission.storytelling?.classes?.name} · {submission.date_submitted}
            </p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            isChecked ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'
          }`}>
            {isChecked ? 'Checked' : 'Pending'}
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

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-5 space-y-5">

          {/* Checked toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#374151]">Mark as checked</p>
              <p className="text-xs text-[#6b7280]">
                {submission.checked_at
                  ? `Checked on ${new Date(submission.checked_at).toLocaleDateString()}`
                  : 'Not yet checked'}
              </p>
            </div>
            <button
              onClick={() => setIsChecked(!isChecked)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isChecked ? 'bg-[#16A34A]' : 'bg-[#d1d5db]'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                isChecked ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <hr className="border-[#e5e7eb]" />

          {/* URLs */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#374151]">Homework Links</label>
            {[
              { val: url1, set: setUrl1, label: 'Link 1' },
              { val: url2, set: setUrl2, label: 'Link 2' },
              { val: url3, set: setUrl3, label: 'Link 3' },
            ].map(({ val, set, label }) => (
              <div key={label} className="flex items-center gap-2">
                <input
                  type="url"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder={`https://... (${label})`}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                />
                {val && (
                  <a href={val} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#3B5BDB] hover:underline whitespace-nowrap">
                    Open →
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#374151]">Attachments</label>
            {[
              { existing: submission.attachment_1, set: setAttachment1, label: 'Attachment 1' },
              { existing: submission.attachment_2, set: setAttachment2, label: 'Attachment 2' },
              { existing: submission.attachment_3, set: setAttachment3, label: 'Attachment 3' },
            ].map(({ existing, set, label }) => (
              <div key={label} className="space-y-1">
                {existing && (
                  <div className="flex items-center gap-2">
                    <img src={existing} alt={label} className="w-16 h-16 object-cover rounded-lg border border-[#e5e7eb]" />
                    <a href={existing} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-[#3B5BDB] hover:underline">
                      View full image →
                    </a>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#d1d5db] text-sm text-[#6b7280] cursor-pointer hover:border-[#3B5BDB] hover:text-[#3B5BDB] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {existing ? `Replace ${label}` : `Upload ${label}`}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => set(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            ))}
          </div>

          <hr className="border-[#e5e7eb]" />

          {/* Advantages */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#374151]">Advantages</label>
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
            <label className="block text-sm font-medium text-[#374151]">Disadvantages</label>
            <textarea
              value={disadvantages}
              onChange={(e) => setDisadvantages(e.target.value)}
              placeholder="What could the student improve?"
              rows={3}
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
      </div>
    </main>
  )
}
