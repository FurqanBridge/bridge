'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTeachers } from '@/hooks/useTeachers'

export default function TeachersPage() {
  const { teachers, loading, addTeacher, deleteTeacher } = useTeachers()
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleAdd() {
    if (!name.trim()) return
    setAdding(true)
    setError(null)

    const success = await addTeacher({ name: name.trim() })
    if (!success) setError('Could not add teacher. That name may already exist.')
    else setName('')

    setAdding(false)
  }

  async function handleDelete(id: string, teacherName: string) {
    const confirmed = confirm(`Delete "${teacherName}"? This will fail if they are linked to any makeup sessions.`)
    if (!confirmed) return
    const success = await deleteTeacher(id)
    if (!success) setError('Could not delete — this teacher may be linked to existing makeup sessions.')
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-semibold text-[#1a1a2e] text-sm">Teacher Portal</span>
          </div>
        </div>
        <button onClick={handleSignOut} className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors">Sign out</button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">Teachers</h1>
          <p className="text-sm text-[#6b7280]">Manage teachers available for makeup classes</p>
        </div>

        {/* Add Teacher */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[#1a1a2e]">Add a teacher</h2>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Teacher name"
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] transition"
            />
            <button
              onClick={handleAdd}
              disabled={adding || !name.trim()}
              className="bg-[#3B5BDB] hover:bg-[#2f4ac4] disabled:bg-[#93a3e8] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        {/* Teachers List */}
        <div>
          <h2 className="text-sm font-semibold text-[#1a1a2e] mb-3">
            Teachers <span className="text-[#6b7280] font-normal">({teachers.length})</span>
          </h2>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-4 animate-pulse h-14" />
              ))}
            </div>
          ) : teachers.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
              <p className="text-sm text-[#6b7280]">No teachers yet. Add your first teacher above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {teachers.map((t) => (
                <div key={t.id} className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                      <span className="text-xs font-bold text-[#3B5BDB]">{t.name[0]}</span>
                    </div>
                    <p className="text-sm font-medium text-[#1a1a2e]">{t.name}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="text-xs text-[#DC2626] hover:underline"
                  >
                    Delete
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
