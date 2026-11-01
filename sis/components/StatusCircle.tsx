'use client'

import { useRef } from 'react'
import type { StorytellingProgress } from '@/types'
import {
  PROGRESS_CIRCLE,
  PROGRESS_LABEL,
  nextOnClick,
  nextOnDoubleClick,
} from '@/lib/progress'

type Props = {
  progress: StorytellingProgress
  onChange: (next: StorytellingProgress) => void
}

// Click = pending <-> checked. Double click = Pass.
export default function StatusCircle({ progress, onChange }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleClick() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      timer.current = null
      onChange(nextOnClick(progress))
    }, 250)
  }

  function handleDoubleClick() {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    onChange(nextOnDoubleClick(progress))
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title={`${PROGRESS_LABEL[progress]} — click to toggle, double-click for Pass`}
      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors touch-manipulation select-none ${PROGRESS_CIRCLE[progress]}`}
    >
      {progress !== 'pending' && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}
