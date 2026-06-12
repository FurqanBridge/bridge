import { createClient } from './client'

const BUCKET = 'attachments'

/**
 * Uploads an image file to Supabase Storage
 * @param file - The image file to upload
 * @param submissionId - The submission ID to organize files under
 * @param slot - The attachment slot (1, 2, or 3)
 * @returns The public URL of the uploaded file, or null on error
 */
export async function uploadAttachment(
  file: File,
  submissionId: string,
  slot: 1 | 2 | 3
): Promise<string | null> {
  const supabase = createClient()

  const fileExt = file.name.split('.').pop()
  const filePath = `submissions/${submissionId}/attachment_${slot}.${fileExt}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { upsert: true })

  if (error) {
    console.error('Upload error:', error.message)
    return null
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Deletes an attachment from Supabase Storage
 * @param submissionId - The submission ID
 * @param slot - The attachment slot (1, 2, or 3)
 */
export async function deleteAttachment(
  submissionId: string,
  slot: 1 | 2 | 3,
  fileExt: string
): Promise<void> {
  const supabase = createClient()
  const filePath = `submissions/${submissionId}/attachment_${slot}.${fileExt}`

  const { error } = await supabase.storage.from(BUCKET).remove([filePath])
  if (error) {
    console.error('Delete error:', error.message)
  }
}

/**
 * Deletes all attachments for a submission (e.g. when deleting a submission)
 * @param submissionId - The submission ID
 */
export async function deleteAllAttachments(submissionId: string): Promise<void> {
  const supabase = createClient()

  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list(`submissions/${submissionId}`)

  if (error || !files) return

  const paths = files.map((f) => `submissions/${submissionId}/${f.name}`)
  await supabase.storage.from(BUCKET).remove(paths)
}
