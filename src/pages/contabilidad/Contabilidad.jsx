// src/pages/contabilidad/Contabilidad.jsx
import { useEffect, useMemo, useState } from 'react';
import { abrirCaja, cerrarCaja, obtenerResumenCaja, obtenerEstadoCajaHoy } from '../../api/caja';
import { listarTransaccionesPorFecha, eliminarTransaccion } from '../../api/flujoCaja';
import NuevoIngresoModal from './NuevoIngresoModal';
import NuevoGastoModal from './NuevoGastoModal';
import CajaActionModal from './CajaActionModal';
import HistorialCaja from './HistorialCaja';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
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

  return `${y}-${m}-${d}`;
};

export default function Contabilidad() {
  const { user } = useAuth();
  const esFundador = user?.rol === 'Fundador';

  const [fecha, setFecha] = useState(hoyISO());
  const [resumen, setResumen] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showIngreso, setShowIngreso] = useState(false);
  const [showGasto, setShowGasto] = useState(false);

  const [tab, setTab] = useState('hoy');

  const [cajaHoy, setCajaHoy] = useState({
    loading: true,
    abierta: false,
    caja: null,
  });

  const [modalCaja, setModalCaja] = useState({
    show: false,
    action: null,
  });

  const [flash, setFlash] = useState(null);

  const [confirmTx, setConfirmTx] = useState(null);
  const [editTx, setEditTx] = useState(null);

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

  const calcularTotalesDesdeTransacciones = (arr) => {
    const ingresosTotales = (arr || [])
      .filter((t) => t?.tipo === 'Ingreso')
      .reduce((acc, t) => acc + (Number(t?.monto) || 0), 0);

    const egresosTotales = (arr || [])
      .filter((t) => t?.tipo === 'Egreso')
      .reduce((acc, t) => acc + (Number(t?.monto) || 0), 0);

    return { ingresosTotales, egresosTotales };
  };

  const getMetodo = (t) => t?.metodo ?? t?.metodoPago ?? '-';

  const getPacienteLabel = (t) => {
    if (!t?.paciente) return '-';
    if (typeof t.paciente === 'string') return t.paciente || '-';
    return t.paciente?.nombreCompleto ?? '-';
  };

  const getDetalleExtra = () => null;

  async function cargarDatos(fechaStr) {
    setLoading(true);
    try {
      const estado = await refreshEstadoCajaHoy();

      let resumenData = null;
      try {
        const resResumen = await obtenerResumenCaja(fechaStr);
        resumenData = resResumen?.resumen || null;
      } catch {
        resumenData = null;
      }

      const resTrans = await listarTransaccionesPorFecha(fechaStr);
      const trans = resTrans?.transacciones || [];
      setTransacciones(trans);

      const { ingresosTotales, egresosTotales } = calcularTotalesDesdeTransacciones(trans);

      if (!resumenData && estado?.abierta && estado?.caja) {
        const saldoInicial = estado.caja.saldoInicial ?? 0;
        resumenData = {
          saldoInicial,
          ingresosTotales,
          egresosTotales,
          saldoFinal: saldoInicial + ingresosTotales - egresosTotales,
        };
      }

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

  useEffect(() => {
    const hasModalOpen = showIngreso || showGasto || modalCaja.show || !!confirmTx || !!editTx;

    if (hasModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [showIngreso, showGasto, modalCaja.show, confirmTx, editTx]);

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

  const handleCajaConfirm = async (valor) => {
    try {
      if (modalCaja.action === 'abrir') {
        const resp = await abrirCaja(valor);

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
    setEditTx(null);
    await cargarDatos(fecha);
  };

  const handleEditarTransaccion = (tx) => {
    if (!esFundador) return;
    setEditTx(tx);
  };

  const handlePedirEliminar = (tx) => {
    if (!esFundador) return;
    setConfirmTx(tx);
  };

  const handleConfirmEliminar = async () => {
    if (!confirmTx?._id) return;

    try {
      await eliminarTransaccion(confirmTx._id);

      setFlash({ type: 'success', text: 'Movimiento eliminado.' });
      setConfirmTx(null);

      await cargarDatos(fecha);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'No se pudo eliminar el movimiento.';
      setFlash({ type: 'error', text: msg });
    } finally {
      setConfirmTx(null);
    }
  };

  const saldoInicial = resumen?.saldoInicial ?? 0;
  const ingresos = resumen?.ingresosTotales ?? 0;
  const egresos = resumen?.egresosTotales ?? 0;
  const saldoFinal = resumen?.saldoFinal ?? saldoInicial + ingresos - egresos;

  const puedeOperarHoy = !cajaHoy.loading && cajaHoy.abierta;
  const puedeAbrirCaja = !cajaHoy.loading && !cajaHoy.abierta;

  const showEditIngreso = !!editTx && editTx?.tipo === 'Ingreso';
  const showEditGasto = !!editTx && editTx?.tipo === 'Egreso';

  if (loading || cajaHoy.loading) {
    return <div className='contabilidad-page'>Cargando...</div>;
  }

  return (
    <div className='contabilidad-page'>
      <h1 className='contab-title'>Contabilidad</h1>
      <p className='contab-subtitle'>Control diario de caja y movimientos.</p>

      {flash && (
        <div className={`alert-banner ${flash.type}`}>
          <span>{flash.text}</span>
          <button type='button' onClick={() => setFlash(null)}>
            <i className='bi bi-x-lg' />
          </button>
        </div>
      )}

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

      {tab === 'hoy' && (
        <div className='contab-panel'>
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

                          <td className='acciones' style={{ textAlign: 'center' }}>
                            <div className='acciones-wrapper' style={{ justifyContent: 'center' }}>
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

      {tab === 'historial' && <HistorialCaja />}

      {showIngreso && puedeOperarHoy && (
        <NuevoIngresoModal
          show={showIngreso}
          onClose={() => setShowIngreso(false)}
          onCreated={handleTransaccionCreada}
          mode='create'
          transaccion={null}
        />
      )}

      {showGasto && puedeOperarHoy && (
        <NuevoGastoModal
          show={showGasto}
          onClose={() => setShowGasto(false)}
          onCreated={handleTransaccionCreada}
          mode='create'
          transaccion={null}
        />
      )}

      {showEditIngreso && (
        <NuevoIngresoModal
          show={showEditIngreso}
          onClose={() => setEditTx(null)}
          onCreated={handleTransaccionCreada}
          mode='edit'
          transaccion={editTx}
        />
      )}

      {showEditGasto && (
        <NuevoGastoModal
          show={showEditGasto}
          onClose={() => setEditTx(null)}
          onCreated={handleTransaccionCreada}
          mode='edit'
          transaccion={editTx}
        />
      )}

      <CajaActionModal
        show={modalCaja.show}
        action={modalCaja.action}
        onClose={() => setModalCaja({ show: false, action: null })}
        onConfirm={handleCajaConfirm}
      />

      <ConfirmModal
        open={!!confirmTx}
        title='Eliminar movimiento'
        subtitle='Esta acción no se puede deshacer.'
        message='¿Seguro que deseas eliminar este movimiento?'
        confirmText='Eliminar'
        cancelText='Cancelar'
        confirmIconClass='bi bi-trash3'
        onClose={() => setConfirmTx(null)}
        onConfirm={handleConfirmEliminar}
      >
        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
          <strong style={{ color: '#111827' }}>{confirmTx?.tipo}</strong> • {confirmTx?.descripcion}{' '}
          • ${Number(confirmTx?.monto || 0).toLocaleString('es-CO')}
        </div>
      </ConfirmModal>
    </div>
  );
}
