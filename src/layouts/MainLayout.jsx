import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  const { user, org, loading, logout } = useAuth();

  // Manejo de resize
  useEffect(() => {
    const onResize = () => {
      setIsDesktop(window.innerWidth >= 992);
      if (window.innerWidth >= 992) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (loading) return null;

  const inicial = user?.nombre?.charAt(0)?.toUpperCase();

  return (
    <div className='layout-wrapper'>
      {/* ================= TOPBAR ================= */}
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
            {/* Nombre de la empresa */}
            <span className='empresa'>{org?.nombre}</span>

            {/* Avatar */}
            <div className='user-circle'>{inicial}</div>

            {/* Nombre + industria */}
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

      {/* ================= SIDEBAR ================= */}
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

          <NavLink to='/app/contabilidad'>
            <i className='bi bi-cash-coin' /> Contabilidad
          </NavLink>

          <NavLink to='/app/administracion'>
            <i className='bi bi-person-gear' /> Administración
          </NavLink>

          <NavLink to='/app/configuracion'>
            <i className='bi bi-gear' /> Configuración
          </NavLink>
        </nav>
      </aside>

      {!isDesktop && open && <div className='sidebar-overlay' onClick={() => setOpen(false)} />}

      {/* ================= CONTENIDO ================= */}
      <div className='content-wrapper'>
        <main className='main-content'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
