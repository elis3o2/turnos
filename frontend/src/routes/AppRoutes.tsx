import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { PrivateRoute } from '../common/components';
import Layout from '../common/layouts/Layout';
import {MensajesDashboard }  from '../pages/InicioPage/MensajeDashboardPage';
import {ConfiguracionPage }  from '../pages/ConfiguracionPage.tsx/ConfiguracionPage';
import TurnosPage from '../pages/TurnoPage/TurnoPage';
import HistoricoPage from '../pages/HistoricoPage/HistoricoPage';
import ListaEsperaPage from '../pages/ListaEsperaPage/ListaEsperaPage';
import AddEspera from '../pages/AddEsperaPage/AddEsperaPage';
import PlantillasPage from '../pages/PlantillasPage/PlantillasPage';
import ConfirmPage from '../pages/ConfirmPage/ConfirmPage';
import EsperaHistorico from '../pages/EsperaHistoricoPage/EsperaHistoricoPage';
import Eliseo from '../pages/EiseoPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/confirma" element={<ConfirmPage />} />
      <Route path="/private-route-secret/eliseo-feuli" element={<Eliseo />} />
      {/* Rutas privadas con Layout */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/home" element={<MensajesDashboard />} />
        <Route path="/list" element={<ConfiguracionPage />} />
        <Route path="/plantillas" element={<PlantillasPage />} /> 
        <Route path="/plantillas/:tipo" element={<PlantillasPage />} />
        <Route path="/turnos" element={<TurnosPage />}/>
        <Route path="/historico" element={<HistoricoPage />}/>
        <Route path="/espera" element={<ListaEsperaPage />}/>
        <Route path="/add-espera" element={<AddEspera />}/>
        <Route path='/espera-paciente' element={<EsperaHistorico />}/>
        <Route path='*' element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;