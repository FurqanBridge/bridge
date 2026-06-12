'use client'

import { useParams, useRouter } from 'next/navigation'
import { useStudents } from '@/hooks/useStudents'

export default function ClassPage() {
  const params = useParams()
  const router = useRouter()

  const classId = params.id as string

  const {
    students,
    loading,
    error,
  } = useStudents(classId)

  return (
    <main className="min-h-screen bg-[#F0F4FF]">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/classes')}
            className="text-sm text-[#3B5BDB] hover:underline"
          >
            ← Back to Classes
          </button>
        </div>

        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">
            Students {}
          </h1>

          <p className="text-sm text-[#6b7280]">
            {students.length} student(s)
          </p>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#e5e7eb] p-4 animate-pulse h-14"
              />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
            <p className="text-sm text-[#6b7280]">
              No students in this class.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-xl border border-[#e5e7eb] px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">
                    {student.korean_name}
                  </p>

                  <p className="text-xs text-[#6b7280]">
                    {student.english_name}
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push(`/students/${student.id}`)
                  }
                  className="text-xs text-[#3B5BDB] hover:underline"
                >
                  View →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Student Button */}
        <div className="pt-4">
          <button
            onClick={() => router.push(`/classes/${classId}/add-student`)}
            className="w-full bg-[#3B5BDB] hover:bg-[#2f4ac4] text-white text-sm font-medium py-3 rounded-xl transition-colors"
          >
            + Add Student
          </button>
        </div>

      </div>
    </main>
  )
}