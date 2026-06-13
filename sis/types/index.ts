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
  name: string
  class_id: string
  created_at: string
  updated_at: string
}

export type NewStudent = {
  name: string
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
  storytelling_id: string
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
  storytelling_id: string
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

export type UpdateSubmission = Partial<Omit<NewSubmission, 'student_id' | 'storytelling_id'>> & {
  is_checked?: boolean
}

// Full submission with related data joined (for display purposes)
export type SubmissionWithDetails = Submission & {
  students: Pick<Student, 'name'>
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
