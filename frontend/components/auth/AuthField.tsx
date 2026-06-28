"use client"

import { useState, type InputHTMLAttributes, type ReactNode } from "react"
import styles from "./AuthField.module.css"

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 8c0-2.2 2.7-4.5 6-4.5S14 5.8 14 8s-2.7 4.5-6 4.5S2 10.2 2 8z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="8" cy="8" r="1.8" fill="currentColor" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M4 4.5C2.8 5.4 2 6.6 2 8c0 2.2 2.7 4.5 6 4.5a7.3 7.3 0 002.9-.6M7 3.5c.3 0 .7-.02 1 0C11.3 3.5 14 5.8 14 8c0 .7-.24 1.4-.65 2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface AuthFieldProps {
  id: string
  label: string
  icon?: ReactNode
  showToggle?: boolean
  error?: string
  inputProps: InputHTMLAttributes<HTMLInputElement>
}

export function AuthField({
  id,
  label,
  icon,
  showToggle = false,
  error,
  inputProps,
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false)
  const type = showToggle ? (visible ? "text" : "password") : inputProps.type

  return (
    <div className={styles.fieldWrap}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <input
          id={id}
          {...inputProps}
          type={type}
          className={`${styles.input}${showToggle ? ` ${styles.inputWithToggle}` : ""}`}
        />
        {showToggle && (
          <button
            type="button"
            className={styles.inputToggle}
            onClick={() => setVisible((v) => !v)}
            tabIndex={-1}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  )
}
