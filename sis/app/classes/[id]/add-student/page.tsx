'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStudents } from '@/hooks/useStudents'

export default function AddStudentPage() {
  const params = useParams()
  const router = useRouter()

  const classId = params.id as string

  const { addStudent } = useStudents()

  const [koreanName, setKoreanName] = useState('')
  const [englishName, setEnglishName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!koreanName.trim()) {
      setError('Korean name is required.')
      return
    }

    setSaving(true)
    setError(null)

    const success = await addStudent({
      english_name: englishName.trim(),
      korean_name: koreanName.trim(),
      class_id: classId,
    })

    if (!success) {
      setError('Failed to add student.')
      setSaving(false)
      return
    }

    router.push(`/classes/${classId}`)
  }

  return (
    <main className="min-h-screen bg-[#F0F4FF]">
      <div className="max-w-2xl mx-auto px-4 py-6">

        <button
          onClick={() => router.back()}
          className="text-sm text-[#3B5BDB] hover:underline mb-6"
        >
          ← Back
        </button>

        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 space-y-5">

          <div>
            <h1 className="text-xl font-bold text-[#1a1a2e]">
              Add Student
            </h1>

            <p className="text-sm text-[#6b7280] mt-1">
              Create a new student in this class.
            </p>
          </div>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-[#6b7280]">
              Korean Name
            </label>

            <input
              type="text"
              value={koreanName}
              onChange={(e) => setKoreanName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] text-[#1a1a2e]"
              placeholder="김민수"
            />
          </div>

          <div>
            <label className="text-xs text-[#6b7280]">
              English Name
            </label>

            <input
              type="text"
              value={englishName}
              onChange={(e) => setEnglishName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] text-[#1a1a2e]"
              placeholder="Minsu Kim"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#3B5BDB] hover:bg-[#2f4ac4] disabled:bg-[#93a3e8] text-white font-medium py-3 rounded-xl"
          >
            {saving ? 'Saving...' : 'Add Student'}
          </button>
        </div>
      </div>
    </main>
  )
}