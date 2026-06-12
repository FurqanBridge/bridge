'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useClasses } from '@/hooks/useClasses'

export default function ClassesPage() {
  const { classes, loading, addClass, deleteClass } = useClasses()
  const [newClassName, setNewClassName] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleAddClass() {
    if (!newClassName.trim()) return
    setAdding(true)
    setError(null)

    const success = await addClass({ name: newClassName.trim() })
    if (!success) setError('A class with that name may already exist.')
    else setNewClassName('')

    setAdding(false)
  }

  async function handleDeleteClass(id: string, name: string) {
    const confirmed = confirm(`Delete class "${name}"? This cannot be undone.`)
    if (!confirmed) return
    const success = await deleteClass(id)
    if (!success) setError('Could not delete — this class may have students linked to it.')
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

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Page Title */}
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">Classes</h1>
          <p className="text-sm text-[#6b7280]">Manage your classes</p>
        </div>

        {/* Add Class Form */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[#1a1a2e]">Add a new class</h2>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
              placeholder="e.g. 8-1, 1, 3"
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition"
            />
            <button
              onClick={handleAddClass}
              disabled={adding || !newClassName.trim()}
              className="bg-[#3B5BDB] hover:bg-[#2f4ac4] disabled:bg-[#93a3e8] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              {adding ? 'Adding...' : 'Add class'}
            </button>
          </div>
        </div>

        {/* Classes List */}
        <div>
          <h2 className="text-sm font-semibold text-[#1a1a2e] mb-3">Your classes</h2>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-4 animate-pulse h-14" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
              <p className="text-sm text-[#6b7280]">No classes yet. Add your first class above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {classes.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                      <span className="text-xs font-bold text-[#3B5BDB]">{c.name}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1a2e]">Class {c.name}</p>
                      <p className="text-xs text-[#6b7280]">Added {new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/classes/${c.id}`)}
                      className="text-xs text-[#3B5BDB] hover:underline"
                    >
                      View students →
                    </button>
                    <button
                      onClick={() => handleDeleteClass(c.id, c.name)}
                      className="text-xs text-[#DC2626] hover:underline ml-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
