import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import Dashboard from '../pages/dashboard/Dashboard';
import Pacientes from '../pages/pacientes/Pacientes';
import PacienteEditar from '../pages/pacientes/PacienteEditar';
import PacienteDetalle from '../pages/pacientes/PacienteDetalle';
import Agenda from '../pages/agenda/Agenda';
import Contabilidad from '../pages/contabilidad/Contabilidad';

// import NotasClinicas from '../pages/notas/NotasClinicas';
// import Administracion from '../pages/admin/Administracion';
// import Configuracion from '../pages/configuracion/Configuracion';

import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- AUTH --- */}
        <Route path='/' element={<Navigate to='/login' />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* --- APP INTERNA PROTEGIDA --- */}
        <Route
          path='/app'
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path='pacientes' element={<Pacientes />} />
          <Route path='pacientes/:id' element={<PacienteDetalle />} />
          <Route path='pacientes/:id/editar' element={<PacienteEditar />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="contabilidad" element={<Contabilidad />} />

          {/* Rutas futuras */}
          {/* <Route path="notas" element={<NotasClinicas />} /> */}
          {/* <Route path="administracion" element={<Administracion />} /> */}
          {/* <Route path="configuracion" element={<Configuracion />} /> */}
        </Route>

        {/* --- 404 REDIRECT --- */}
        <Route path='*' element={<Navigate to='/login' />} />
      </Routes>
    </BrowserRouter>
  );
}
