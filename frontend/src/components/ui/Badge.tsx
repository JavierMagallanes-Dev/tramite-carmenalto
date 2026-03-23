interface Props {
  text:     string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
}

const estadoVariant = (estado: string): NonNullable<Props['variant']> => {
  const map: Record<string, NonNullable<Props['variant']>> = {
    'Recibido':   'info',
    'En proceso': 'warning',
    'Observado':  'danger',
    'Derivado':   'default',
    'Resuelto':   'success',
    'Archivado':  'default',
  }
  return map[estado] ?? 'default'
}

export const Badge = ({ text, variant }: Props) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium
    ${variants[variant ?? estadoVariant(text)]}`}>
    {text}
  </span>
)