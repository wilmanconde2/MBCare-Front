// src/pages/administracion/Administracion.jsx

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  listarUsuarios,
  crearUsuario,
  toggleUsuarioActivo,
  cambiarRolUsuario,
} from '../../api/usuarios';

import UsersToolbar from '../../components/administracion/UsersToolbar';
import UsersTable from '../../components/administracion/UsersTable';
import CreateUserModal from '../../components/administracion/CreateUserModal';

export default function Administracion() {
  const { user } = useAuth();

  const isFundador = useMemo(() => user?.rol === 'Fundador', [user]);

  const canAccess = isFundador;
  const canCreate = isFundador; // backend: solo Fundador
  const canToggle = isFundador; // backend: solo Fundador
  const canChangeRole = isFundador; // backend: solo Fundador

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);

  async function loadUsuarios() {
    setLoading(true);
    try {
      const data = await listarUsuarios();
      setUsuarios(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canAccess) loadUsuarios();
  }, [canAccess]);

  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtro === 'activos') return u.activo;
    if (filtro === 'inactivos') return !u.activo;
    return true;
  });

  async function onToggle(id) {
    if (!canToggle) return;
    await toggleUsuarioActivo(id);
    loadUsuarios();
  }

  async function onCreate(data) {
    if (!canCreate) return;
    await crearUsuario(data);
    setOpenCreate(false);
    loadUsuarios();
  }

  async function onChangeRol(id, rol) {
    if (!canChangeRole) return;
    await cambiarRolUsuario(id, rol);
    loadUsuarios();
  }

  if (!canAccess) {
    return (
      <div className='pacientes-page admin-page'>
        <div className='pacientes-header'>
          <h2 className='page-title'>Administración</h2>
        </div>
        <div className='pacientes-card'>
          <p className='empty-state'>No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='pacientes-page admin-page'>
      <div className='pacientes-header'>
        <h2 className='page-title'>Administración</h2>

        {canCreate && (
          <button className='btn-primary-action' onClick={() => setOpenCreate(true)} type='button'>
            <i className='bi bi-person-plus'></i> Crear usuario
          </button>
        )}
      </div>

      <div className='pacientes-card admin-card'>
        <div className='admin-toolbar-row'>
          {/* <h3 className='card-title'>Administración</h3> */}
          <UsersToolbar filtro={filtro} onChangeFiltro={setFiltro} />
        </div>

        <div className='table-wrapper'>
          <UsersTable
            usuarios={usuariosFiltrados}
            loading={loading}
            canToggle={canToggle}
            canChangeRole={canChangeRole}
            onToggleEstado={onToggle}
            onChangeRol={onChangeRol}
          />
        </div>

        {!loading && !usuariosFiltrados.length && (
          <p className='empty-state'>No hay usuarios registrados.</p>
        )}
      </div>

      {openCreate && canCreate && (
        <CreateUserModal onClose={() => setOpenCreate(false)} onSubmit={onCreate} />
      )}
    </div>
  );
}
