// src/layouts/MainLayout.jsx

import { useState, useEffect, useMemo } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  const { user, org, loading, logout } = useAuth();

  useEffect(() => {
    const onResize = () => {
      setIsDesktop(window.innerWidth >= 992);
      if (window.innerWidth >= 992) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const rol = user?.rol;

  const isFundador = useMemo(() => rol === 'Fundador', [rol]);
  const isAsistente = useMemo(() => rol === 'Asistente', [rol]);
  const isProfesional = useMemo(() => rol === 'Profesional', [rol]);

  const canSeeContabilidad = useMemo(() => isFundador || isAsistente, [isFundador, isAsistente]);
  const canSeeAdministracion = useMemo(() => isFundador, [isFundador]);

  if (loading) return null;

  const inicial = user?.nombre?.charAt(0)?.toUpperCase();

  return (
    <div className='layout-wrapper'>
      <header className='topbar'>
        {!isDesktop && (
          <button className='menu-btn' onClick={() => setOpen(true)}>
            <i className='bi bi-list' />
          </button>
        )}

        <h2 className='brand-text'>
          M&B <span>Care</span>
        </h2>

        {isDesktop ? (
          <div className='topbar-info'>
            <span className='empresa'>{org?.nombre}</span>
            <div className='user-circle'>{inicial}</div>

            <div className='user-data'>
              <span className='user-name'>{user?.nombre}</span>
              <span className='user-org'>{org?.industria}</span>
            </div>

            <button className='logout-btn' onClick={logout}>
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className='topbar-right'>
            <div className='user-circle'>{inicial}</div>
            <button className='logout-btn' onClick={logout}>
              Cerrar Sesión
            </button>
          </div>
        )}
      </header>

      <aside className={`sidebar ${open ? 'open' : ''} ${isDesktop ? 'desktop' : ''}`}>
        <div className='sidebar-header'>
          {!isDesktop && (
            <button className='close-btn' onClick={() => setOpen(false)}>
              <i className='bi bi-x-lg' />
            </button>
          )}
        </div>

        <nav className='sidebar-menu'>
          <NavLink to='/app' end>
            <i className='bi bi-bell' /> Dashboard
          </NavLink>

          <NavLink to='/app/pacientes'>
            <i className='bi bi-people' /> Pacientes
          </NavLink>

          <NavLink to='/app/agenda'>
            <i className='bi bi-calendar-event' /> Agenda
          </NavLink>

          <NavLink to='/app/notas'>
            <i className='bi bi-file-text' /> Notas Clínicas
          </NavLink>

          {canSeeContabilidad && (
            <NavLink to='/app/contabilidad'>
              <i className='bi bi-cash-coin' /> Contabilidad
            </NavLink>
          )}

          {canSeeAdministracion && (
            <NavLink to='/app/administracion'>
              <i className='bi bi-people-fill' /> Administración
            </NavLink>
          )}

          {/* Configuración queda visible para todos por ahora */}
          <NavLink to='/app/configuracion'>
            <i className='bi bi-gear' /> Configuración
          </NavLink>
        </nav>
      </aside>

      {!isDesktop && open && <div className='sidebar-overlay' onClick={() => setOpen(false)} />}

      <div className='content-wrapper'>
        <main className='main-content'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
