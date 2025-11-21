import { useEffect, useState } from 'react';
import axios from '../../api/axios';

export default function Dashboard() {
  const [clinico, setClinico] = useState({
    pacientes: 0,
    citas: 0,
    notas: 0,
    recordatorios: 0,
  });

  const [financiero, setFinanciero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get('/dashboard');

        // Datos clínicos (siempre disponibles)
        if (res.data.clinico) {
          setClinico({
            pacientes: res.data.clinico.pacientes || 0,
            citas: res.data.clinico.citas || 0,
            notas: res.data.clinico.notas || 0,
            recordatorios: res.data.clinico.recordatorios || 0,
          });
        }

        // Datos financieros (solo Fundador o Asistente)
        if (res.data.financiero) {
          setFinanciero(res.data.financiero);
        }
      } catch (err) {
        console.error('Error al cargar dashboard:', err);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div className='dashboard-page'>Cargando...</div>;

  return (
    <div className='dashboard-page'>
      <h1 className='dash-title'>¡Bienvenido!</h1>

      {/* ============================
          SECCIÓN CLÍNICA
      ============================ */}
      <div className='dash-grid'>
        <div className='dash-card'>
          <div>
            <h3>Pacientes</h3>
            <p className='value'>{clinico.pacientes}</p>
            <span className='desc'>Total registrados</span>
          </div>
          <i className='bi bi-people icon'></i>
        </div>

        <div className='dash-card'>
          <div>
            <h3>Citas</h3>
            <p className='value'>{clinico.citas}</p>
            <span className='desc'>Programadas</span>
          </div>
          <i className='bi bi-calendar-event icon'></i>
        </div>

        <div className='dash-card'>
          <div>
            <h3>Notas Clínicas</h3>
            <p className='value'>{clinico.notas}</p>
            <span className='desc'>Registradas</span>
          </div>
          <i className='bi bi-file-text icon'></i>
        </div>

        <div className='dash-card'>
          <div>
            <h3>Recordatorios</h3>
            <p className='value'>{clinico.recordatorios}</p>
            <span className='desc'>Pendientes</span>
          </div>
          <i className='bi bi-bell icon'></i>
        </div>
      </div>

      {/* ============================
          SECCIÓN FINANCIERA (CONDICIONAL)
      ============================ */}
      {financiero && (
        <>
          <h2 className='dash-title' style={{ marginTop: '2rem' }}>
            Resumen de Actividad Financiera
          </h2>

          <div className='dash-grid'>
            <div className='dash-card'>
              <div>
                <h3>Ingresos de Hoy</h3>
                <p className='value'>{financiero.hoy.ingresos}</p>
                <span className='desc'>Total ingresos</span>
              </div>
              <i className='bi bi-graph-up icon'></i>
            </div>

            <div className='dash-card'>
              <div>
                <h3>Egresos de Hoy</h3>
                <p className='value'>{financiero.hoy.egresos}</p>
                <span className='desc'>Total egresos</span>
              </div>
              <i className='bi bi-graph-down icon'></i>
            </div>

            <div className='dash-card'>
              <div>
                <h3>Cajas Cerradas</h3>
                <p className='value'>{financiero.cajasCerradas}</p>
                <span className='desc'>Total histórico</span>
              </div>
              <i className='bi bi-box-seam icon'></i>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
