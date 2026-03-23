import type { HTMLAttributes } from 'react'
interface Props extends HTMLAttributes<HTMLDivElement> {
  title?: string
}

export const Card = ({ title, children, className = '', ...props }: Props) => (
  <div
    {...props}
    className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
  >
    {title && (
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
)