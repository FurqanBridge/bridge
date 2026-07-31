'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSubmission } from '@/hooks/useSubmissions'
import { uploadAttachment, deleteAttachment } from '@/lib/supabase/storage'
import TranscribeButton from '@/components/TranscribeButton'

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
  const [preview1, setPreview1] = useState<string | null>(null)
  const [preview2, setPreview2] = useState<string | null>(null)
  const [preview3, setPreview3] = useState<string | null>(null)
  const [removed1, setRemoved1] = useState(false)
  const [removed2, setRemoved2] = useState(false)
  const [removed3, setRemoved3] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
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

  // Clean up object URLs when component unmounts or files change
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
      if (file) setRemoved1(false)
    } else if (slot === 2) {
      setAttachment2(file)
      setPreview2(file ? URL.createObjectURL(file) : null)
      if (file) setRemoved2(false)
    } else {
      setAttachment3(file)
      setPreview3(file ? URL.createObjectURL(file) : null)
      if (file) setRemoved3(false)
    }
  }

  function handleRemoveAttachment(slot: 1 | 2 | 3) {
    if (slot === 1) {
      setAttachment1(null)
      if (preview1) URL.revokeObjectURL(preview1)
      setPreview1(null)
      setRemoved1(true)
    } else if (slot === 2) {
      setAttachment2(null)
      if (preview2) URL.revokeObjectURL(preview2)
      setPreview2(null)
      setRemoved2(true)
    } else {
      setAttachment3(null)
      if (preview3) URL.revokeObjectURL(preview3)
      setPreview3(null)
      setRemoved3(true)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleSave() {
    if (!submission) return
    setSaving(true)
    setError(null)
    setSaved(false)

    // Upload any new attachments, or clear if removed
    let attachmentUrl1 = removed1 ? null : submission.attachment_1
    let attachmentUrl2 = removed2 ? null : submission.attachment_2
    let attachmentUrl3 = removed3 ? null : submission.attachment_3

    if (attachment1) attachmentUrl1 = await uploadAttachment(attachment1, submission.id, 1)
    else if (removed1 && submission.attachment_1) {
      const ext = submission.attachment_1.split('.').pop() ?? 'jpg'
      await deleteAttachment(submission.id, 1, ext)
    }

    if (attachment2) attachmentUrl2 = await uploadAttachment(attachment2, submission.id, 2)
    else if (removed2 && submission.attachment_2) {
      const ext = submission.attachment_2.split('.').pop() ?? 'jpg'
      await deleteAttachment(submission.id, 2, ext)
    }

    if (attachment3) attachmentUrl3 = await uploadAttachment(attachment3, submission.id, 3)
    else if (removed3 && submission.attachment_3) {
      const ext = submission.attachment_3.split('.').pop() ?? 'jpg'
      await deleteAttachment(submission.id, 3, ext)
    }

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

  async function handleDelete() {
    if (!submission) return
    const confirmed = confirm(
      `Delete this submission for ${submission.students?.name}? This cannot be undone.`
    )
    if (!confirmed) return

    setDeleting(true)
    setError(null)

    // Delete any attachments from storage first
    const { deleteAllAttachments } = await import('@/lib/supabase/storage')
    await deleteAllAttachments(id)

    const { error } = await supabase.from('submissions').delete().eq('id', id)

    if (error) {
      setError('Could not delete submission. Please try again.')
      setDeleting(false)
      return
    }

    router.push('/dashboard')
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
              <div key={label} className="space-y-1">
                <div className="flex items-center gap-2">
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
                {val && val.includes('youtube') && (
                  <TranscribeButton
                    url={val}
                    urlLabel={label}
                    studentName={submission.students?.name ?? ''}
                    storytellingName={submission.storytelling?.name ?? ''}
                    className={submission.storytelling?.classes?.name ?? ''}
                    dateSubmitted={submission.date_submitted}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#374151]">Attachments</label>
            {[
              { existing: submission.attachment_1, preview: preview1, slot: 1 as const, removed: removed1, set: (f: File | null) => handleFileSelect(f, 1), label: 'Attachment 1' },
              { existing: submission.attachment_2, preview: preview2, slot: 2 as const, removed: removed2, set: (f: File | null) => handleFileSelect(f, 2), label: 'Attachment 2' },
              { existing: submission.attachment_3, preview: preview3, slot: 3 as const, removed: removed3, set: (f: File | null) => handleFileSelect(f, 3), label: 'Attachment 3' },
            ].map(({ existing, preview, slot, removed, set, label }) => {
              const displayImage = preview ?? (removed ? null : existing)
              return (
                <div key={label} className="space-y-1">
                  {displayImage && (
                    <div className="flex items-center gap-2">
                      <img src={displayImage} alt={label} className="w-16 h-16 object-cover rounded-lg border border-[#e5e7eb]" />
                      <div className="flex flex-col gap-1">
                        {preview ? (
                          <span className="text-xs text-[#F59E0B]">New image — not saved yet</span>
                        ) : (
                          <a href={existing!} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-[#3B5BDB] hover:underline">
                            View full image →
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(slot)}
                          className="text-xs text-[#DC2626] hover:underline text-left"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                  {removed && !preview && (
                    <p className="text-xs text-[#F59E0B]">Will be removed when you save</p>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#d1d5db] text-sm text-[#6b7280] cursor-pointer hover:border-[#3B5BDB] hover:text-[#3B5BDB] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {displayImage ? `Replace ${label}` : `Upload ${label}`}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => set(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              )
            })}
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

        {/* Delete Submission */}
        <div className="bg-white rounded-xl border border-[#FECACA] p-5 space-y-2">
          <h2 className="text-sm font-semibold text-[#DC2626]">Delete this submission</h2>
          <p className="text-xs text-[#6b7280]">
            This will permanently remove this submission and cannot be undone.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full bg-white border border-[#DC2626] hover:bg-[#FEF2F2] disabled:opacity-50 text-[#DC2626] font-medium text-sm py-2.5 rounded-lg transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete submission'}
          </button>
        </div>
      </div>
    </main>
  )
}
