'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, LockKeyhole } from 'lucide-react'

type IconMode = 'lock' | 'keyhole'

type Props = {
  id: string
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  placeholder?: string
  required?: boolean
  /** Lock icon inside the input (matches /auth/* pages) */
  leftIconInInput?: boolean
  iconMode?: IconMode
  /** When false, icon appears on the label only (matches /(auth)/* pages) */
  showIconOnLabel?: boolean
  inputClassName?: string
}

export function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete = 'current-password',
  placeholder,
  required = true,
  leftIconInInput = true,
  iconMode = 'lock',
  showIconOnLabel = false,
  inputClassName,
}: Props) {
  const [visible, setVisible] = useState(false)
  const LeftIcon = iconMode === 'keyhole' ? LockKeyhole : Lock

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label flex items-center gap-2">
        {showIconOnLabel && <LeftIcon className="h-4 w-4 shrink-0" aria-hidden />}
        {label}
      </label>
      <div className="relative">
        {leftIconInInput && !showIconOnLabel && (
          <LeftIcon
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
        )}
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={
            inputClassName ??
            (leftIconInInput && !showIconOnLabel
              ? 'form-input w-full pl-10 pr-12'
              : 'form-input w-full px-4 pr-12')
          }
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
        </button>
      </div>
    </div>
  )
}
