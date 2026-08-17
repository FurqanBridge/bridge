// ============================================
// Student Information System - TypeScript Types
// These match the database schema exactly
// ============================================


// ============================================
// CLASS
// ============================================
export type Class = {
  id: string
  name: string                  // e.g. "8-1", "1", "3"
  created_at: string
}

export type NewClass = {
  name: string
}


// ============================================
// STUDENT
// ============================================
export type Student = {
  id: string
  first_name: string
  last_name: string
  class_id: string
  created_at: string
  updated_at: string
}

export type NewStudent = {
  first_name: string
  last_name: string
  class_id: string
}

// Student with class name joined (for display purposes)
export type StudentWithClass = Student & {
  classes: Pick<Class, 'name'>
}


// ============================================
// ASSIGNMENT
// ============================================
export type Storytelling = {
  id: string
  name: string                  // e.g. "Chapter 5 Essay"
  class_id: string
  created_at: string
}

export type NewStorytelling = {
  name: string
  class_id: string
}

// Storytelling with class name joined (for display purposes)
export type StorytellingWithClass = Storytelling & {
  classes: Pick<Class, 'name'>
}


// ============================================
// HOMEWORK SUBMISSION
// ============================================
export type Submission = {
  id: string
  student_id: string
  assignment_id: string
  date_submitted: string        // ISO date string e.g. "2024-06-12"

  // Teacher checkbox
  is_checked: boolean
  checked_at: string | null

  // Homework links
  url_1: string | null
  url_2: string | null
  url_3: string | null

  // Attachments (Supabase Storage URLs)
  attachment_1: string | null
  attachment_2: string | null
  attachment_3: string | null

  // Teacher notes
  advantages: string | null
  disadvantages: string | null

  // Timestamps
  created_at: string
  updated_at: string
}

export type NewSubmission = {
  student_id: string
  assignment_id: string
  date_submitted: string
  url_1?: string | null
  url_2?: string | null
  url_3?: string | null
  attachment_1?: string | null
  attachment_2?: string | null
  attachment_3?: string | null
  advantages?: string | null
  disadvantages?: string | null
}

export type UpdateSubmission = Partial<Omit<NewSubmission, 'student_id' | 'assignment_id'>> & {
  is_checked?: boolean
}

// Full submission with related data joined (for display purposes)
export type SubmissionWithDetails = Submission & {
  students: Pick<Student, 'first_name' | 'last_name'>
  storytelling: Pick<Storytelling, 'name'> & {
    classes: Pick<Class, 'name'>
  }
}


// ============================================
// UI HELPERS
// ============================================

// Attachment slot type
export type AttachmentSlot = 1 | 2 | 3

// URL slot type
export type UrlSlot = 1 | 2 | 3

// Checked status for filtering
export type CheckedStatus = 'all' | 'checked' | 'unchecked'


// ============================================
// TEACHER
// ============================================
export type Teacher = {
  id: string
  name: string
  created_at: string
}

export type NewTeacher = {
  name: string
}


// ============================================
// MAKEUP SCHEDULE
// ============================================
export type MakeupProgress =
  | 'scheduled'
  | 'voca_retest'
  | 'build_up_class'
  | 'complete'
  | 'cancellation'

export type MakeupSchedule = {
  id: string
  student_id: string
  class_id: string
  teacher_id: string
  date_absent: string | null
  date_makeup: string | null
  class_time: string | null
  progress: MakeupProgress
  textbook_materials: string | null
  reason_for_absence: string | null
  created_at: string
  updated_at: string
}

export type NewMakeupSchedule = {
  student_id: string
  class_id: string
  teacher_id: string
  date_absent?: string | null
  date_makeup?: string | null
  class_time?: string | null
  progress?: MakeupProgress
  textbook_materials?: string | null
  reason_for_absence?: string | null
}

export type UpdateMakeupSchedule = Partial<Omit<NewMakeupSchedule, 'student_id' | 'class_id'>>

// Full makeup schedule with related data joined
export type MakeupScheduleWithDetails = MakeupSchedule & {
  students: Pick<Student, 'name'>
  classes: Pick<Class, 'name'>
  teachers: Pick<Teacher, 'name'>
}
