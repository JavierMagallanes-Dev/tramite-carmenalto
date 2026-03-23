import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  loading?: boolean
}

const variants = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
  danger:    'bg-red-600 hover:bg-red-700 text-white',
  ghost:     'hover:bg-gray-100 text-gray-600',
}

export const Button = ({
  variant = 'primary', loading, children, className = '', disabled, ...props
}: Props) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variants[variant]} ${className}`}
  >
    {loading ? 'Cargando...' : children}
  </button>
)