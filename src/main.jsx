// src/main.jsx

import ReactDOM from 'react-dom/client';
import AppRouter from './router/AppRouter';

import { AuthProvider } from './context/AuthContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './styles/global.scss';
import './styles/auth.scss';
import './styles/layout.scss';

import './styles/ui/confirmModal.scss';
import './styles/pacientes.scss';
import './styles/pacienteEditar.scss';
import './styles/pacienteDetalle.scss';
import './styles/contabilidad.scss';
import './styles/administracion.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <AppRouter />
  </AuthProvider>,
);
