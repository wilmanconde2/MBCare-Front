import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  // TEMPORAL (después se traerá de AuthContext)
  const empresa = "Mind & Body";
  const logoEmpresa = "/logo.png";
  const inicial = "W";
  const nombre = "wilman conde";
  const organizacion = "Psicología";

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
      if (window.innerWidth >= 992) setOpen(false); // evita overlay residual
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="layout-wrapper">

      {/* ======================= TOPBAR FIJO ======================= */}
      <header className="topbar">
        {/* Mobile: hamburguesa */}
        {!isDesktop && (
          <button className="menu-btn" onClick={() => setOpen(true)}>
            <i className="bi bi-list" />
          </button>
        )}

        {/* Brand */}
        <h2 className="brand-text">
          M&B <span>Care</span>
        </h2>

        {/* ---- DERECHA DEL TOPBAR ---- */}
        {isDesktop ? (
          <div className="topbar-info">
            <span className="empresa">{empresa}</span>
            <img src={logoEmpresa} alt="logo" className="empresa-logo" />

            <div className="user-circle">{inicial}</div>

            <div className="user-data">
              <span className="user-name">{nombre}</span>
              <span className="user-org">{organizacion}</span>
            </div>

            <button className="logout-btn">Cerrar Sesión</button>
          </div>
        ) : (
          <div className="topbar-right">
            <div className="user-circle">{inicial}</div>
            <button className="logout-btn">Cerrar Sesión</button>
          </div>
        )}
      </header>

      {/* ======================= SIDEBAR ======================= */}
      <aside className={`sidebar ${open ? "open" : ""} ${isDesktop ? "desktop" : ""}`}>
        <div className="sidebar-header">
          {!isDesktop && (
            <button className="close-btn" onClick={() => setOpen(false)}>
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/app" end>
            <i className="bi bi-bell" /> Dashboard
          </NavLink>
          <NavLink to="/app/pacientes">
            <i className="bi bi-people" /> Pacientes
          </NavLink>
          <NavLink to="/app/agenda">
            <i className="bi bi-calendar-event" /> Agenda
          </NavLink>
          <NavLink to="/app/notas">
            <i className="bi bi-file-text" /> Notas Clínicas
          </NavLink>
          <NavLink to="/app/contabilidad">
            <i className="bi bi-cash-coin" /> Contabilidad
          </NavLink>
          <NavLink to="/app/administracion">
            <i className="bi bi-person-gear" /> Administración
          </NavLink>
          <NavLink to="/app/configuracion">
            <i className="bi bi-gear" /> Configuración
          </NavLink>
        </nav>
      </aside>

      {/* Overlay solo mobile */}
      {!isDesktop && open && (
        <div className="sidebar-overlay" onClick={() => setOpen(false)} />
      )}

      {/* ======================= CONTENIDO ======================= */}
      <div className="content-wrapper">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
