// src/pages/contabilidad/Contabilidad.jsx
import { useEffect, useState } from 'react';
import { abrirCaja, cerrarCaja, obtenerResumenCaja, obtenerEstadoCajaHoy } from '../../api/caja';
import { listarTransaccionesPorFecha } from '../../api/flujoCaja';
import NuevoIngresoModal from './NuevoIngresoModal';
import NuevoGastoModal from './NuevoGastoModal';
import CajaActionModal from './CajaActionModal';
import HistorialCaja from './HistorialCaja'; // ✅ NUEVO
import '../../styles/contabilidad.scss';

const hoyISO = () => new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

export default function Contabilidad() {
  const [fecha, setFecha] = useState(hoyISO());
  const [resumen, setResumen] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showIngreso, setShowIngreso] = useState(false);
  const [showGasto, setShowGasto] = useState(false);

  const [tab, setTab] = useState('hoy'); // 'hoy' | 'historial'

  // ✅ Estado de caja (abierta/cerrada) para controlar UI
  const [cajaHoy, setCajaHoy] = useState({
    loading: true,
    abierta: false,
    caja: null,
  });

  // Modal genérico para abrir/cerrar caja
  const [modalCaja, setModalCaja] = useState({
    show: false,
    action: null, // 'abrir' | 'cerrar'
  });

  // Banner de mensajes
  const [flash, setFlash] = useState(null); // { type: 'success' | 'error', text: string }

  const refreshEstadoCajaHoy = async () => {
    try {
      const data = await obtenerEstadoCajaHoy();
      setCajaHoy({
        loading: false,
        abierta: !!data?.abierta,
        caja: data?.caja || null,
      });
      return {
        abierta: !!data?.abierta,
        caja: data?.caja || null,
      };
    } catch (e) {
      console.error('Error obteniendo estado de caja:', e);
      setCajaHoy({ loading: false, abierta: false, caja: null });
      return { abierta: false, caja: null };
    }
  };

  async function cargarDatos(fechaStr) {
    setLoading(true);
    try {
      // 0) Estado de la caja (para habilitar/deshabilitar acciones)
      const estado = await refreshEstadoCajaHoy();

      // 1) Resumen del día
      let resumenData = null;
      try {
        const resResumen = await obtenerResumenCaja(fechaStr);
        resumenData = resResumen?.resumen || null;
      } catch {
        resumenData = null;
      }

      // ✅ Si NO hay resumen pero la caja está abierta, mostramos apertura con saldoInicial
      if (!resumenData && estado?.abierta && estado?.caja) {
        resumenData = {
          saldoInicial: estado.caja.saldoInicial ?? 0,
          ingresosTotales: 0,
          egresosTotales: 0,
          saldoFinal: estado.caja.saldoInicial ?? 0,
        };
      }

      setResumen(resumenData);

      // 2) Transacciones del día
      const resTrans = await listarTransaccionesPorFecha(fechaStr);
      setTransacciones(resTrans?.transacciones || []);
    } catch (err) {
      console.error('Error cargando contabilidad:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarDatos(fecha);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  const abrirCajaModal = () => {
    if (cajaHoy.abierta) {
      setFlash({ type: 'error', text: 'Ya hay una caja abierta para hoy.' });
      return;
    }
    setModalCaja({ show: true, action: 'abrir' });
  };

  const cerrarCajaModal = () => {
    if (!cajaHoy.abierta) {
      setFlash({ type: 'error', text: 'No hay una caja abierta para hoy.' });
      return;
    }
    setModalCaja({ show: true, action: 'cerrar' });
  };

  // Confirmar acción desde el modal (abrir/cerrar)
  const handleCajaConfirm = async (valor) => {
    try {
      if (modalCaja.action === 'abrir') {
        const resp = await abrirCaja(valor);

        // Optimista: pintamos apertura al instante
        if (resp?.caja) {
          const caja = resp.caja;
          setResumen({
            saldoInicial: caja.saldoInicial,
            ingresosTotales: 0,
            egresosTotales: 0,
            saldoFinal: caja.saldoInicial,
          });
        }

        setFlash({
          type: 'success',
          text: resp?.message || 'Caja del día abierta exitosamente.',
        });
      } else if (modalCaja.action === 'cerrar') {
        const resp = await cerrarCaja();
        setFlash({
          type: 'success',
          text: resp?.message || 'Caja cerrada exitosamente.',
        });

        // ✅ si cierras caja y estabas en modales, los cerramos
        setShowIngreso(false);
        setShowGasto(false);
      }

      await cargarDatos(fecha);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error en la operación de caja.';
      setFlash({ type: 'error', text: msg });
    } finally {
      setModalCaja({ show: false, action: null });
    }
  };

  const handleTransaccionCreada = async () => {
    setShowIngreso(false);
    setShowGasto(false);
    await cargarDatos(fecha);
  };

  const saldoInicial = resumen?.saldoInicial ?? 0;
  const ingresos = resumen?.ingresosTotales ?? 0;
  const egresos = resumen?.egresosTotales ?? 0;
  const saldoFinal = resumen?.saldoFinal ?? saldoInicial + ingresos - egresos;

  // ✅ reglas UI
  const puedeOperarHoy = !cajaHoy.loading && cajaHoy.abierta;
  const puedeAbrirCaja = !cajaHoy.loading && !cajaHoy.abierta;

  // ✅ Evita render antes de tener estado de caja listo
  if (loading || cajaHoy.loading) {
    return <div className='contabilidad-page'>Cargando...</div>;
  }

  return (
    <div className='contabilidad-page'>
      <h1 className='contab-title'>Contabilidad</h1>
      <p className='contab-subtitle'>Control diario de caja y movimientos.</p>

      {/* ====== BANNER MENSAJES ====== */}
      {flash && (
        <div className={`alert-banner ${flash.type}`}>
          <span>{flash.text}</span>
          <button type='button' onClick={() => setFlash(null)}>
            <i className='bi bi-x-lg' />
          </button>
        </div>
      )}

      {/* ====== RESUMEN SUPERIOR ====== */}
      <div className='contab-summary'>
        <div className='summary-card apertura'>
          <div>
            <p className='label'>Apertura</p>
            <p className='amount'>${saldoInicial.toLocaleString('es-CO')}</p>
            <p className='hint'>Saldo inicial del día</p>
          </div>
          <div className='icon-box'>
            <i className='bi bi-safe2'></i>
          </div>
        </div>

        <div className='summary-card ingresos'>
          <div>
            <p className='label'>Ingresos</p>
            <p className='amount'>${ingresos.toLocaleString('es-CO')}</p>
            <p className='hint'>Pagos registrados</p>
          </div>
          <div className='icon-box'>
            <i className='bi bi-graph-up-arrow'></i>
          </div>
        </div>

        <div className='summary-card egresos'>
          <div>
            <p className='label'>Egresos</p>
            <p className='amount'>${egresos.toLocaleString('es-CO')}</p>
            <p className='hint'>Gastos del día</p>
          </div>
          <div className='icon-box'>
            <i className='bi bi-graph-down-arrow'></i>
          </div>
        </div>

        <div className='summary-card balance'>
          <div>
            <p className='label'>Balance</p>
            <p className='amount'>${saldoFinal.toLocaleString('es-CO')}</p>
            <p className='hint'>Resultado esperado en caja</p>
          </div>
          <div className='icon-box'>
            <i className='bi bi-calculator'></i>
          </div>
        </div>
      </div>

      {/* ====== TABS (HOY / HISTORIAL) ====== */}
      <div className='contab-tabs'>
        <button
          className={`tab-btn ${tab === 'hoy' ? 'active' : ''}`}
          onClick={() => setTab('hoy')}
        >
          <i className='bi bi-calendar-day'></i> Hoy
        </button>

        <button
          className={`tab-btn ${tab === 'historial' ? 'active' : ''}`}
          onClick={() => setTab('historial')}
        >
          <i className='bi bi-clock-history'></i> Historial
        </button>
      </div>

      {/* ====== PANEL HOY ====== */}
      {tab === 'hoy' && (
        <div className='contab-panel'>
          {/* Toolbar superior */}
          <div className='transacciones-toolbar'>
            {/* ✅ Solo si NO hay caja abierta */}
            {puedeAbrirCaja && (
              <button type='button' className='btn-open-caja' onClick={abrirCajaModal}>
                <i className='bi bi-door-open'></i> Abrir caja
              </button>
            )}

            {/* ✅ Solo si hay caja abierta */}
            {puedeOperarHoy && (
              <>
                <button type='button' className='btn-ingreso' onClick={() => setShowIngreso(true)}>
                  <i className='bi bi-plus-circle'></i> Nuevo ingreso
                </button>

                <button type='button' className='btn-gasto' onClick={() => setShowGasto(true)}>
                  <i className='bi bi-dash-circle'></i> Nuevo gasto
                </button>

                <button type='button' className='btn-cerrar-caja' onClick={cerrarCajaModal}>
                  <i className='bi bi-door-closed'></i> Cerrar caja
                </button>
              </>
            )}

            {/* ✅ Si está cerrada, texto discreto */}
            {!cajaHoy.abierta && <span className='caja-estado-label'>Caja del día cerrada</span>}
          </div>

          {/* Resumen del día (texto) */}
          <div className='resumen-dia-card'>
            <div className='title'>Resumen del día</div>

            <div className='linea apertura'>
              <span className='label'>Saldo inicial</span>
              <span className='value'>${saldoInicial.toLocaleString('es-CO')}</span>
            </div>

            <div className='linea ingresos'>
              <span className='label'>Total ingresos</span>
              <span className='value'>${ingresos.toLocaleString('es-CO')}</span>
            </div>

            <div className='linea egresos'>
              <span className='label'>Total egresos</span>
              <span className='value'>${egresos.toLocaleString('es-CO')}</span>
            </div>

            <div className='linea balance'>
              <span className='label'>Saldo final esperado</span>
              <span className='value'>${saldoFinal.toLocaleString('es-CO')}</span>
            </div>
          </div>

          {/* Tabla de movimientos */}
          <div className='transacciones-card'>
            <div className='transacciones-title'>Movimientos de hoy</div>

            {transacciones.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                No hay movimientos registrados para hoy.
              </p>
            ) : (
              <div className='tabla-wrapper'>
                <table className='tabla-transacciones'>
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Detalle</th>
                      <th>Método</th>
                      <th>Tipo</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacciones.map((t) => {
                      const fechaT = new Date(t.createdAt);
                      const hora = fechaT.toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <tr key={t._id}>
                          <td>{hora}</td>
                          <td>
                            {t.descripcion}
                            {t.paciente && (
                              <>
                                <br />
                                <small className='text-muted'>{t.paciente.nombreCompleto}</small>
                              </>
                            )}
                          </td>
                          <td>{t.metodoPago}</td>
                          <td className={t.tipo === 'Ingreso' ? 'tipo-ingreso' : 'tipo-egreso'}>
                            {t.tipo}
                          </td>
                          <td className='monto'>${Number(t.monto).toLocaleString('es-CO')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====== PANEL HISTORIAL ====== */}
      {tab === 'historial' && <HistorialCaja />}

      {/* ✅ No abrir modales si no hay caja abierta */}
      {showIngreso && puedeOperarHoy && (
        <NuevoIngresoModal
          show={showIngreso}
          onClose={() => setShowIngreso(false)}
          onCreated={handleTransaccionCreada}
        />
      )}

      {showGasto && puedeOperarHoy && (
        <NuevoGastoModal
          show={showGasto}
          onClose={() => setShowGasto(false)}
          onCreated={handleTransaccionCreada}
        />
      )}

      {/* Modal genérico para abrir/cerrar caja */}
      <CajaActionModal
        show={modalCaja.show}
        action={modalCaja.action}
        onClose={() => setModalCaja({ show: false, action: null })}
        onConfirm={handleCajaConfirm}
      />
    </div>
  );
}
