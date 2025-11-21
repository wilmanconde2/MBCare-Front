import ReactDOM from 'react-dom/client';
import AppRouter from './router/AppRouter';

import { AuthProvider } from './context/AuthContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './styles/global.scss';
import './styles/auth.scss';
import './styles/layout.scss';
import './styles/pacientes.scss';
import './styles/nuevoPacienteModal.scss';
import './styles/pacienteEditar.scss';
import './styles/pacienteDetalle.scss';


ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <AppRouter />
  </AuthProvider>,
);
