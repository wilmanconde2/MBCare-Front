// src/pages/contabilidad/Contabilidad.jsx
import { useEffect, useMemo, useState } from 'react';
import { abrirCaja, cerrarCaja, obtenerResumenCaja, obtenerEstadoCajaHoy } from '../../api/caja';
import { listarTransaccionesPorFecha } from '../../api/flujoCaja';
import NuevoIngresoModal from './NuevoIngresoModal';
import NuevoGastoModal from './NuevoGastoModal';
import CajaActionModal from './CajaActionModal';
import HistorialCaja from './HistorialCaja';
import { useAuth } from '../../context/AuthContext';
import '../../styles/contabilidad.scss';

// ✅ HOY en America/Bogota (sin toISOString)
const hoyISO = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const d = parts.find((p) => p.type === 'day')?.value;

  return `${y}-${m}-${d}`; // YYYY-MM-DD
};

export default function Contabilidad() {
  const { auth } = useAuth();
  const esFundador = auth?.user?.rol === 'Fundador';

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

  // ✅ Confirm delete (mismo UI que Pacientes)
  const [confirmTx, setConfirmTx] = useState(null); // { _id, descripcion, monto, tipo, metodo?, paciente? }

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

  // ✅ Helper: calcular totales del día desde transacciones (si aún no hay resumen persistido)
  const calcularTotalesDesdeTransacciones = (arr) => {
    const ingresosTotales = (arr || [])
      .filter((t) => t?.tipo === 'Ingreso')
      .reduce((acc, t) => acc + (Number(t?.monto) || 0), 0);

    const egresosTotales = (arr || [])
      .filter((t) => t?.tipo === 'Egreso')
      .reduce((acc, t) => acc + (Number(t?.monto) || 0), 0);

    return { ingresosTotales, egresosTotales };
  };

  // ✅ Helpers para render robusto (backend puede devolver paciente como string u objeto)
  const getMetodo = (t) => t?.metodo ?? t?.metodoPago ?? '-';

  const getPacienteLabel = (t) => {
    if (!t?.paciente) return '-';
    if (typeof t.paciente === 'string') return t.paciente || '-';
    // objeto populate
    return t.paciente?.nombreCompleto ?? '-';
  };

  const getDetalleExtra = (t) => {
    // si quieres mantener el paciente debajo del detalle como antes, aquí lo controlas
    // ahora lo mostramos en columna "Paciente", entonces devolvemos null
    return null;
  };

  async function cargarDatos(fechaStr) {
    setLoading(true);
    try {
      // 0) Estado de la caja
      const estado = await refreshEstadoCajaHoy();

      // 1) Resumen del día (si existe en BD)
      let resumenData = null;
      try {
        const resResumen = await obtenerResumenCaja(fechaStr);
        resumenData = resResumen?.resumen || null;
      } catch {
        resumenData = null;
      }

      // 2) Transacciones del día
      const resTrans = await listarTransaccionesPorFecha(fechaStr);
      const trans = resTrans?.transacciones || [];
      setTransacciones(trans);

      // 3) Totales calculados
      const { ingresosTotales, egresosTotales } = calcularTotalesDesdeTransacciones(trans);

      // ✅ Si NO hay resumen pero la caja está abierta, mostramos apertura + totales reales del día
      if (!resumenData && estado?.abierta && estado?.caja) {
        const saldoInicial = estado.caja.saldoInicial ?? 0;
        resumenData = {
          saldoInicial,
          ingresosTotales,
          egresosTotales,
          saldoFinal: saldoInicial + ingresosTotales - egresosTotales,
        };
      }

      // ✅ Si hay resumen pero viene incompleto, lo reforzamos con lo calculado
      if (resumenData) {
        const saldoInicial = resumenData.saldoInicial ?? estado?.caja?.saldoInicial ?? 0;
        const ing = Number(resumenData.ingresosTotales ?? ingresosTotales) || 0;
        const egr = Number(resumenData.egresosTotales ?? egresosTotales) || 0;
        const saldoFinal = resumenData.saldoFinal ?? saldoInicial + ing - egr;

        resumenData = {
          ...resumenData,
          saldoInicial,
          ingresosTotales: ing,
          egresosTotales: egr,
          saldoFinal,
        };
      }

      setResumen(resumenData);
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

        // Optimista
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

  // ✅ CRUD handlers (marcados para conectar endpoints luego)
  const handleEditarTransaccion = (tx) => {
    // TODO: abrir modal de edición (cuando lo tengas listo)
    // TODO: conectar PUT endpoint update (cuando me pases update/delete de transacciones)
    console.log('EDIT tx:', tx);
    setFlash({ type: 'error', text: 'Editar: pendiente conectar endpoint update.' });
  };

  const handlePedirEliminar = (tx) => {
    setConfirmTx(tx);
  };

  const handleConfirmEliminar = async () => {
    if (!confirmTx?._id) return;

    try {
      // TODO: conectar DELETE endpoint (cuando me pases update/delete de transacciones)
      console.log('DELETE tx:', confirmTx._id);
      setFlash({ type: 'error', text: 'Eliminar: pendiente conectar endpoint delete.' });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'No se pudo eliminar el movimiento.';
      setFlash({ type: 'error', text: msg });
    } finally {
      setConfirmTx(null);
      // cuando conectes delete real, recarga:
      // await cargarDatos(fecha);
    }
  };

  const saldoInicial = resumen?.saldoInicial ?? 0;
  const ingresos = resumen?.ingresosTotales ?? 0;
  const egresos = resumen?.egresosTotales ?? 0;
  const saldoFinal = resumen?.saldoFinal ?? saldoInicial + ingresos - egresos;

  // ✅ reglas UI
  const puedeOperarHoy = !cajaHoy.loading && cajaHoy.abierta;
  const puedeAbrirCaja = !cajaHoy.loading && !cajaHoy.abierta;

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

      {/* ====== TABS ====== */}
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
          {/* Toolbar */}
          <div className='transacciones-toolbar'>
            {puedeAbrirCaja && (
              <button type='button' className='btn-open-caja' onClick={abrirCajaModal}>
                <i className='bi bi-door-open'></i> Abrir caja
              </button>
            )}

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

            {!cajaHoy.abierta && <span className='caja-estado-label'>Caja del día cerrada</span>}
          </div>

          {/* Resumen del día */}
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

          {/* Tabla movimientos */}
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

                      {/* ✅ en mobile NO se muestra Método */}
                      <th className='col-hide-mobile'>Método</th>

                      <th>Paciente</th>
                      <th>Tipo</th>
                      <th>Monto</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transacciones.map((t) => {
                      const fechaT = new Date(t.createdAt);

                      const hora = fechaT.toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      const metodo = getMetodo(t);
                      const pacienteLabel = getPacienteLabel(t);
                      const extra = getDetalleExtra(t);

                      return (
                        <tr key={t._id}>
                          <td>{hora}</td>

                          <td>
                            {t.descripcion}
                            {extra && (
                              <>
                                <br />
                                <small className='text-muted'>{extra}</small>
                              </>
                            )}
                          </td>

                          <td className='col-hide-mobile'>{metodo}</td>

                          <td>{pacienteLabel}</td>

                          <td className={t.tipo === 'Ingreso' ? 'tipo-ingreso' : 'tipo-egreso'}>
                            {t.tipo}
                          </td>

                          <td className='monto'>${Number(t.monto).toLocaleString('es-CO')}</td>

                          {/* ✅ Acciones estilo Pacientes */}
                          <td className='acciones' style={{ textAlign: 'center' }}>
                            <div className='acciones-wrapper' style={{ justifyContent: 'center' }}>
                              {/* ❌ Quitamos VER */}

                              {/* Solo Fundador puede editar/eliminar */}
                              {esFundador && (
                                <>
                                  <i
                                    className='bi bi-pencil-square text-primary ms-3'
                                    title='Editar'
                                    onClick={() => handleEditarTransaccion(t)}
                                    style={{ cursor: 'pointer' }}
                                  />
                                  <i
                                    className='bi bi-x-circle text-danger ms-3'
                                    title='Eliminar'
                                    onClick={() => handlePedirEliminar(t)}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </>
                              )}
                            </div>
                          </td>
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

      {/* ✅ Modales crear */}
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

      {/* Modal abrir/cerrar */}
      <CajaActionModal
        show={modalCaja.show}
        action={modalCaja.action}
        onClose={() => setModalCaja({ show: false, action: null })}
        onConfirm={handleCajaConfirm}
      />

      {/* ====== Confirm eliminar (mismo UI que Pacientes) ====== */}
      {confirmTx && (
        <div
          className='confirm-modal'
          role='dialog'
          aria-modal='true'
          aria-labelledby='confirm-title'
        >
          <div
            className='cm-overlay'
            onMouseDown={(e) => {
              if (e.target.classList.contains('cm-overlay')) setConfirmTx(null);
            }}
          />

          <div className='cm-box cm-pop' role='document'>
            <div className='cm-header'>
              <div className='cm-header-left'>
                <span className='cm-icon' aria-hidden='true'>
                  <i className='bi bi-exclamation-triangle-fill'></i>
                </span>
                <div>
                  <h3 id='confirm-title' className='cm-title'>
                    Eliminar movimiento
                  </h3>
                  <p className='cm-subtitle'>Esta acción no se puede deshacer.</p>
                </div>
              </div>

              <button
                type='button'
                className='cm-close'
                onClick={() => setConfirmTx(null)}
                aria-label='Cerrar'
              >
                <i className='bi bi-x-lg'></i>
              </button>
            </div>

            <div className='cm-body'>
              <div className='cm-alert'>
                <span className='cm-dot' />
                <div>
                  ¿Seguro que deseas eliminar este movimiento?
                  <div style={{ marginTop: '0.35rem', fontSize: '0.9rem', color: '#6b7280' }}>
                    <strong style={{ color: '#111827' }}>{confirmTx?.tipo}</strong> •{' '}
                    {confirmTx?.descripcion} • $
                    {Number(confirmTx?.monto || 0).toLocaleString('es-CO')}
                  </div>
                </div>
              </div>
            </div>

            <div className='cm-actions'>
              <button type='button' className='cm-btn' onClick={() => setConfirmTx(null)}>
                Cancelar
              </button>

              <button type='button' className='cm-btn cm-danger' onClick={handleConfirmEliminar}>
                <i className='bi bi-trash3' /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
