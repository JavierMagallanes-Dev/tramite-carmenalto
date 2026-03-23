import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/auth.store'
import { Layout } from './components/Layout'
import { LoginPage }           from './pages/auth/LoginPage'
import { DashboardPage }       from './pages/DashboardPage'
import { ExpedientesPage }     from './pages/expedientes/ExpedientesPage'
import { ExpedienteDetallePage } from './pages/expedientes/ExpedienteDetallePage'
import { MesaPartesPage }      from './pages/mesa/MesaPartesPage'
import { UsuariosPage }        from './pages/usuarios/UsuariosPage'
import { ReportesPage }        from './pages/reportes/ReportesPage'
import { ConsultaPublicaPage } from './pages/ciudadano/ConsultaPublicaPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
})

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAuthStore(s => s.isAuth())
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/consulta"       element={<ConsultaPublicaPage />} />
          <Route path="/consulta/:cod"  element={<ConsultaPublicaPage />} />
          <Route path="/*" element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard"        element={<DashboardPage />} />
                  <Route path="/expedientes"      element={<ExpedientesPage />} />
                  <Route path="/expedientes/:id"  element={<ExpedienteDetallePage />} />
                  <Route path="/mesa"             element={<MesaPartesPage />} />
                  <Route path="/usuarios"         element={<UsuariosPage />} />
                  <Route path="/reportes"         element={<ReportesPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App