import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { authApi } from '../api/auth.api'
import {
  LayoutDashboard, FileText, Users, BarChart3,
  LogOut, Building2, FolderOpen
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',   label: 'Dashboard',    icon: LayoutDashboard,
    roles: ['Administrador','Jefe de Area','Tecnico','Mesa de Partes'] },
  { to: '/expedientes', label: 'Expedientes',   icon: FolderOpen,
    roles: ['Administrador','Jefe de Area','Tecnico','Mesa de Partes'] },
  { to: '/mesa',        label: 'Mesa de Partes',icon: FileText,
    roles: ['Administrador','Mesa de Partes'] },
  { to: '/usuarios',    label: 'Usuarios',      icon: Users,
    roles: ['Administrador'] },
  { to: '/reportes',    label: 'Reportes',      icon: BarChart3,
    roles: ['Administrador','Jefe de Area'] },
]

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { usuario, logout } = useAuthStore()
  const navigate   = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = async () => {
    await authApi.logout().catch(() => {})
    logout()
    navigate('/login')
  }

  const itemsVisibles = navItems.filter(
    item => item.roles.includes(usuario?.rol ?? '')
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 className="text-blue-600" size={22} />
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">
                Carmen Alto
              </p>
              <p className="text-xs text-gray-500">Trámite documentario</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {itemsVisibles.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                transition-colors
                ${pathname.startsWith(to)
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-gray-800">
              {usuario?.nombres}
            </p>
            <p className="text-xs text-gray-500">{usuario?.rol}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm
              text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}