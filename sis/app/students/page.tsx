'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useStudents } from '@/hooks/useStudents'
import { useClasses } from '@/hooks/useClasses'

export default function StudentsPage() {
  const { students, loading, addStudent, deleteStudent } = useStudents()
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

  async function handleAddStudent() {
    if (!name.trim() || !classId) return
    setAdding(true)
    setError(null)

    const success = await addStudent({
      name: name.trim(),
      class_id: classId,
    })

    if (!success) setError('Could not add student. Please try again.')
    else {
      setName('')
      setClassId('')
    }

    setAdding(false)
  }

  async function handleDeleteStudent(id: string, studentName: string) {
    const confirmed = confirm(`Delete "${studentName}"? This cannot be undone.`)
    if (!confirmed) return
    const success = await deleteStudent(id)
    if (!success) setError('Could not delete — this student may have submissions linked to them.')
  }

  // Filter students by class if a filter is selected
  const filteredStudents = filterClassId
    ? students.filter((s) => s.class_id === filterClassId)
    : students

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
          <h1 className="text-xl font-bold text-[#1a1a2e]">Students</h1>
          <p className="text-sm text-[#6b7280]">Manage your students</p>
        </div>

        {/* Add Student Form */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[#1a1a2e]">Add a new student</h2>

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
              onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
              placeholder="Student name"
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] placeholder:text-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition"
            />
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-[#d1d5db] text-[#1a1a2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:border-transparent transition bg-white"
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>Class {c.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddStudent}
              disabled={adding || !name.trim() || !classId}
              className="bg-[#3B5BDB] hover:bg-[#2f4ac4] disabled:bg-[#93a3e8] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              {adding ? 'Adding...' : 'Add student'}
            </button>
          </div>
        </div>

        {/* Filter by Class */}
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
          <span className="text-xs text-[#6b7280] ml-auto">{filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
            <p className="text-sm text-[#6b7280]">
              {students.length === 0 ? 'No students yet. Add your first student above.' : 'No students in this class.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredStudents.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                    <span className="text-xs font-bold text-[#3B5BDB]">
                      {s.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a2e]">
                      {s.name}
                    </p>
                    <p className="text-xs text-[#6b7280]">Class {s.classes?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/students/${s.id}`)}
                    className="text-xs text-[#3B5BDB] hover:underline"
                  >
                    View →
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(s.id, s.name)}
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
