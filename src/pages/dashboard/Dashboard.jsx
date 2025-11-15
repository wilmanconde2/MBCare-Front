import React from 'react';

export default function Dashboard() {
  return (
    <div className='dashboard-page'>
      {/* Título */}
      <h1 className='dash-title'>¡Bienvenido!</h1>

      {/* Grid responsive */}
      <div className='dash-grid'>
        {/* Card Pacientes */}
        <div className='dash-card'>
          <div>
            <h3>Pacientes</h3>
            <p className='value'>4</p>
            <span className='desc'>Total registrados</span>
          </div>
          <i className='bi bi-people icon'></i>
        </div>

        {/* Card Citas */}
        <div className='dash-card'>
          <div>
            <h3>Citas</h3>
            <p className='value'>4</p>
            <span className='desc'>Programadas</span>
          </div>
          <i className='bi bi-calendar-event icon'></i>
        </div>

        {/* Card Notas Clínicas */}
        <div className='dash-card'>
          <div>
            <h3>Notas Clínicas</h3>
            <p className='value'>2</p>
            <span className='desc'>Registradas</span>
          </div>
          <i className='bi bi-file-text icon'></i>
        </div>

        {/* Card Recordatorios */}
        <div className='dash-card'>
          <div>
            <h3>Recordatorios</h3>
            <p className='value'>0</p>
            <span className='desc'>Pendientes</span>
          </div>
          <i className='bi bi-bell icon'></i>
        </div>
      </div>
    </div>
  );
}
