// src/pages/contabilidad/HistorialCaja.jsx
import { useEffect, useMemo, useState } from 'react';
import { exportarHistorialCajaPDF, obtenerHistorialCajas } from '../../api/caja';
import '../../styles/contabilidad.scss';

const pad2 = (n) => String(n).padStart(2, '0');
const toISODate = (d) => d.toISOString().slice(0, 10);

function buildYearRange(yyyy) {
  const year = Number(yyyy);
  const desde = `${year}-01-01`;
  const hasta = `${year}-12-31`;
  return { desde, hasta };
}

export default function HistorialCaja() {
  // filtros
  const [modoFiltro, setModoFiltro] = useState('mes'); // 'mes' | 'anio'
  const [mes, setMes] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`; // YYYY-MM
  });
  const [anio, setAnio] = useState(() => String(new Date().getFullYear()));

  // paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // data
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cajas, setCajas] = useState([]);

  // UI
  const [expandedId, setExpandedId] = useState(null);
  const [flash, setFlash] = useState(null); // { type, text }

  const params = useMemo(() => {
    const base = { page, limit };

    if (modoFiltro === 'mes') {
      return { ...base, mes };
    }

    const { desde, hasta } = buildYearRange(anio);
    return { ...base, desde, hasta };
  }, [modoFiltro, mes, anio, page, limit]);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await obtenerHistorialCajas(params);
      setTotal(data?.total || 0);
      setTotalPaginas(data?.totalPaginas || 1);
      setCajas(Array.isArray(data?.cajas) ? data.cajas : []);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'No se pudo cargar el historial.';
      setFlash({ type: 'error', text: msg });
      setCajas([]);
      setTotal(0);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // reset page cuando cambia filtro principal
  useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [modoFiltro, mes, anio]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const exportarPDF = async (scope) => {
    try {
      let response;
      let filename = 'historial_cajas.pdf';

      if (scope?.type === 'single') {
        const fechaISO = scope.fechaISO; // YYYY-MM-DD
        response = await exportarHistorialCajaPDF({ desde: fechaISO, hasta: fechaISO });
        filename = `caja_${fechaISO}.pdf`;
      } else if (scope?.type === 'mes') {
        response = await exportarHistorialCajaPDF({ mes });
        filename = `historial_${mes}.pdf`;
      } else if (scope?.type === 'anio') {
        const { desde, hasta } = buildYearRange(anio);
        response = await exportarHistorialCajaPDF({ desde, hasta });
        filename = `historial_${anio}.pdf`;
      } else {
        response = await exportarHistorialCajaPDF(params);
      }

      const blob = response?.data;
      if (!blob) throw new Error('PDF vacío');

      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setFlash({ type: 'success', text: 'PDF generado correctamente.' });
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? 'No tienes permisos para exportar PDF.'
          : 'No se pudo exportar el PDF.');
      setFlash({ type: 'error', text: msg });
    }
  };

  const puedePrev = page > 1;
  const puedeNext = page < totalPaginas;

  return (
    <div className='contab-panel'>
      {/* Banner */}
      {flash && (
        <div className={`alert-banner ${flash.type}`}>
          <span>{flash.text}</span>
          <button type='button' onClick={() => setFlash(null)}>
            <i className='bi bi-x-lg' />
          </button>
        </div>
      )}

      <div className='transacciones-card historial-cajas'>
        <div
          className='transacciones-title'
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span>Historial de cajas cerradas</span>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Total: <strong style={{ color: '#111827' }}>{total}</strong>
          </span>
        </div>

        {/* Filtros */}
        <div
          className='historial-filtros'
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type='button'
              className={`tab-btn ${modoFiltro === 'mes' ? 'active' : ''}`}
              onClick={() => setModoFiltro('mes')}
              style={{ border: '1px solid #e5e7eb' }}
            >
              Mes
            </button>
            <button
              type='button'
              className={`tab-btn ${modoFiltro === 'anio' ? 'active' : ''}`}
              onClick={() => setModoFiltro('anio')}
              style={{ border: '1px solid #e5e7eb' }}
            >
              Año
            </button>
          </div>

          {modoFiltro === 'mes' ? (
            <input
              type='month'
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                background: '#fff',
              }}
            />
          ) : (
            <input
              type='number'
              min='2000'
              max='2100'
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              style={{
                width: '120px',
                padding: '0.55rem 0.75rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                background: '#fff',
              }}
            />
          )}

          <div
            className='historial-actions'
            style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                background: '#fff',
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <button
              type='button'
              className='btn-open-caja'
              onClick={() => exportarPDF({ type: modoFiltro === 'mes' ? 'mes' : 'anio' })}
              style={{ background: '#111827' }}
            >
              <i className='bi bi-file-earmark-pdf' /> Exportar PDF
            </button>
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Cargando historial...</p>
        ) : cajas.length === 0 ? (
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            No hay cajas cerradas para el filtro seleccionado.
          </p>
        ) : (
          <div className='tabla-wrapper no-scroll-mobile'>
            <table className='tabla-transacciones tabla-historial'>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th className='col-hide-mobile'>Saldo inicial</th>
                  <th className='col-hide-mobile'>Total ingresos</th>
                  <th className='col-hide-mobile'>Total egresos</th>
                  <th>Saldo final</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cajas.map((caja) => {
                  const fecha = new Date(caja.fecha);
                  const fechaISO = toISODate(fecha);
                  const abierta = caja.abierta === true;

                  const isExpanded = expandedId === caja._id;

                  return (
                    <>
                      <tr key={caja._id}>
                        <td>{fechaISO}</td>

                        <td className='monto col-hide-mobile'>
                          ${Number(caja.saldoInicial || 0).toLocaleString('es-CO')}
                        </td>

                        <td className='monto col-hide-mobile'>
                          ${Number(caja.ingresosTotales || 0).toLocaleString('es-CO')}
                        </td>

                        <td className='monto col-hide-mobile'>
                          ${Number(caja.egresosTotales || 0).toLocaleString('es-CO')}
                        </td>

                        <td className='monto'>
                          ${Number(caja.saldoFinal || 0).toLocaleString('es-CO')}
                        </td>

                        <td className='acciones'>
                          <i
                            className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                            title='Ver detalle'
                            onClick={() => toggleExpand(caja._id)}
                            style={{ cursor: 'pointer' }}
                          />
                          <i
                            className='bi bi-file-earmark-pdf'
                            title='Exportar PDF de este día'
                            onClick={() => exportarPDF({ type: 'single', fechaISO })}
                            style={{ cursor: 'pointer' }}
                          />
                          {abierta && (
                            <span
                              style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.75rem',
                                color: '#f97316',
                              }}
                            >
                              abierta
                            </span>
                          )}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${caja._id}-detail`}>
                          {/* ✅ colSpan siempre 6 porque el DOM tiene 6 th aunque algunas estén ocultas */}
                          <td colSpan={6} style={{ whiteSpace: 'normal' }}>
                            <div
                              style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '0.9rem 1rem',
                                background: '#f9fafb',
                              }}
                            >
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Fecha</div>
                                  <div style={{ fontWeight: 600, color: '#111827' }}>
                                    {fechaISO}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    Saldo inicial
                                  </div>
                                  <div style={{ fontWeight: 600, color: '#111827' }}>
                                    ${Number(caja.saldoInicial || 0).toLocaleString('es-CO')}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    Total ingresos
                                  </div>
                                  <div style={{ fontWeight: 600, color: '#16a34a' }}>
                                    ${Number(caja.ingresosTotales || 0).toLocaleString('es-CO')}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    Total egresos
                                  </div>
                                  <div style={{ fontWeight: 600, color: '#dc2626' }}>
                                    ${Number(caja.egresosTotales || 0).toLocaleString('es-CO')}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    Saldo final
                                  </div>
                                  <div style={{ fontWeight: 700, color: '#111827' }}>
                                    ${Number(caja.saldoFinal || 0).toLocaleString('es-CO')}
                                  </div>
                                </div>

                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.6rem' }}>
                                  <button
                                    type='button'
                                    className='btn-open-caja'
                                    onClick={() => exportarPDF({ type: 'single', fechaISO })}
                                    style={{ background: '#111827' }}
                                  >
                                    <i className='bi bi-file-earmark-pdf' /> Exportar PDF
                                  </button>
                                </div>
                              </div>

                              <div
                                style={{
                                  marginTop: '0.65rem',
                                  fontSize: '0.85rem',
                                  color: '#6b7280',
                                }}
                              >
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Página <strong style={{ color: '#111827' }}>{page}</strong> de{' '}
            <strong style={{ color: '#111827' }}>{totalPaginas}</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type='button'
              className='tab-btn'
              onClick={() => puedePrev && setPage((p) => p - 1)}
              disabled={!puedePrev}
              style={{
                border: '1px solid #e5e7eb',
                opacity: puedePrev ? 1 : 0.5,
                cursor: puedePrev ? 'pointer' : 'not-allowed',
              }}
            >
              <i className='bi bi-chevron-left' /> Anterior
            </button>

            <button
              type='button'
              className='tab-btn'
              onClick={() => puedeNext && setPage((p) => p + 1)}
              disabled={!puedeNext}
              style={{
                border: '1px solid #e5e7eb',
                opacity: puedeNext ? 1 : 0.5,
                cursor: puedeNext ? 'pointer' : 'not-allowed',
              }}
            >
              Siguiente <i className='bi bi-chevron-right' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
