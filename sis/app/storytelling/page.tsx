'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useStorytelling } from '@/hooks/useStorytelling'
import { useClasses } from '@/hooks/useClasses'

export default function StorytellingPage() {
  const { storytelling, loading, addStorytelling, deleteStorytelling } = useStorytelling()
  const { classes } = useClasses()
  const [name, setName] = useState('')
  const [classId, setClassId] = useState('')
  const [filterClassId, setFilterClassId] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleAdd() {
    if (!name.trim() || !classId) return
    setAdding(true)
    setError(null)

    const success = await addStorytelling({ name: name.trim(), class_id: classId })
    if (!success) setError('Could not add storytelling entry. Please try again.')
    else {
      setName('')
      setClassId('')
    }

    setAdding(false)
  }

  async function handleDelete(id: string, entryName: string) {
    const confirmed = confirm(`Delete "${entryName}"? This cannot be undone.`)
    if (!confirmed) return
    const success = await deleteStorytelling(id)
    if (!success) setError('Could not delete — this entry may have submissions linked to it.')
  }

  const filtered = filterClassId
    ? storytelling.filter((s) => s.class_id === filterClassId)
    : storytelling

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

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Page Title */}
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">Storytelling</h1>
          <p className="text-sm text-[#6b7280]">Manage storytelling assignments per class</p>
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[#1a1a2e]">Add a new storytelling entry</h2>

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
              placeholder="e.g. The Lion and the Mouse"
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition"
            />
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition bg-white"
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>Class {c.name}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={adding || !name.trim() || !classId}
              className="bg-[#3B5BDB] hover:bg-[#2f4ac4] disabled:bg-[#93a3e8] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6b7280]">Filter by class:</span>
          <select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] bg-white"
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>Class {c.name}</option>
            ))}
          </select>
          <span className="text-xs text-[#6b7280] ml-auto">{filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'}</span>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
            <p className="text-sm text-[#6b7280]">
              {storytelling.length === 0
                ? 'No storytelling entries yet. Add your first one above.'
                : 'No entries for this class.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#3B5BDB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a2e]">{s.name}</p>
                    <p className="text-xs text-[#6b7280]">
                      Class {s.classes?.name} · Added {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/storytelling/${s.id}`)}
                    className="text-xs text-[#3B5BDB] hover:underline"
                  >
                    View submissions →
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="text-xs text-[#DC2626] hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
