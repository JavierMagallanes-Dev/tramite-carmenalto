
import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?:  string
  error?:  string
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        ref={ref}
        {...props}
        className={`border rounded-lg px-3 py-2 text-sm outline-none
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
)