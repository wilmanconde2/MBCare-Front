import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

import NuevaNotaModal from './NuevaNotaModal';
import NotaDetalle from './NotaDetalle';

import '../../styles/notasClinicas.scss';

// APIs
import { getPacientes } from '../../api/pacientes';
import { getNotasPorDocumento, eliminarNota, descargarNotasPDF } from '../../api/notas';

export default function NotasClinicas() {
  const [pacientes, setPacientes] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);

  const [selectedPaciente, setSelectedPaciente] = useState([]);
  const paciente = selectedPaciente?.[0] || null;

  const [notas, setNotas] = useState([]);
  const [loadingNotas, setLoadingNotas] = useState(false);

  const [showNuevaEditar, setShowNuevaEditar] = useState(false);
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);

  const [showDetalle, setShowDetalle] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const [exportando, setExportando] = useState(false);

  const pacienteLabelKey = (p) => `${p?.numeroDocumento || ''} — ${p?.nombreCompleto || ''}`;
  const pacientesOptions = useMemo(() => pacientes || [], [pacientes]);

  const cargarPacientes = async () => {
    try {
      setLoadingPacientes(true);
      const res = await getPacientes();
      setPacientes(res.data || []);
    } catch (e) {
      console.error('Error cargando pacientes:', e);
      setPacientes([]);
    } finally {
      setLoadingPacientes(false);
    }
  };

  const cargarNotas = async (numeroDocumento) => {
    try {
      setLoadingNotas(true);
      const res = await getNotasPorDocumento(numeroDocumento);
      setNotas(res?.data?.notas || []);
    } catch (e) {
      console.error('Error cargando notas:', e);
      setNotas([]);
    } finally {
      setLoadingNotas(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  useEffect(() => {
    if (paciente?.numeroDocumento) {
      cargarNotas(paciente.numeroDocumento);
    } else {
      setNotas([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paciente?.numeroDocumento]);

  // ✅ Scroll body: sólido (igual patrón en toda la app)
  const initialBodyOverflowRef = useRef('');

  useEffect(() => {
    initialBodyOverflowRef.current = document.body.style.overflow || '';
    return () => {
      document.body.style.overflow = initialBodyOverflowRef.current;
    };
  }, []);

  useEffect(() => {
    const hasModalOpen = Boolean(confirmId) || showNuevaEditar || showDetalle;
    document.body.style.overflow = hasModalOpen ? 'hidden' : initialBodyOverflowRef.current;

    return () => {
      // cleanup extra (por si React desmonta en medio)
      document.body.style.overflow = initialBodyOverflowRef.current;
    };
  }, [confirmId, showNuevaEditar, showDetalle]);

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-CO', { dateStyle: 'short' });
  };

  const abrirNuevaNota = () => {
    if (!paciente) return;
    setNotaSeleccionada(null);
    setShowNuevaEditar(true);
  };

  const abrirEditar = (nota) => {
    setNotaSeleccionada(nota);
    setShowNuevaEditar(true);
  };

  const abrirDetalle = (nota) => {
    setNotaSeleccionada(nota);
    setShowDetalle(true);
  };

  const handleDelete = async () => {
    try {
      await eliminarNota(confirmId);
      setConfirmId(null);
      if (paciente?.numeroDocumento) await cargarNotas(paciente.numeroDocumento);
    } catch (e) {
      console.error('Error eliminando nota:', e);
      alert('Error eliminando nota');
    }
  };

  const exportarPDF = async () => {
    if (!paciente?.numeroDocumento) return;

    try {
      setExportando(true);
      await descargarNotasPDF(paciente.numeroDocumento);
    } catch (e) {
      console.error('Error exportando PDF:', e);
      alert('No se pudo exportar el PDF');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className='notas-page'>
      {/* Header */}
      <div className='notas-header'>
        <h2 className='page-title'>Notas Clínicas</h2>

        <div className='notas-actions'>
          <Button
            className='btn-nueva-nota'
            onClick={abrirNuevaNota}
            disabled={!paciente}
            title={!paciente ? 'Selecciona un paciente primero' : 'Crear nueva nota'}
            type='button'
          >
            <i className='bi bi-plus-circle'></i> Nueva Nota
          </Button>

          <Button
            variant='outline-primary'
            className='btn-export'
            onClick={exportarPDF}
            disabled={!paciente || exportando}
            title={!paciente ? 'Selecciona un paciente primero' : 'Exportar todas las notas en PDF'}
            type='button'
          >
            <i className='bi bi-filetype-pdf'></i> {exportando ? 'Exportando...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      {/* ✅ Card búsqueda (NO debe cortar dropdown) */}
      <div className='notas-card notas-card--search mb-3'>
        <h3 className='card-title'>Buscar notas clinicas</h3>

        <div className='notas-search'>
          <Typeahead
            id='paciente-typeahead'
            labelKey={pacienteLabelKey}
            options={pacientesOptions}
            selected={selectedPaciente}
            onChange={(sel) => setSelectedPaciente(sel)}
            placeholder={
              loadingPacientes ? 'Cargando pacientes...' : 'Escribe nombre o documento...'
            }
            minLength={1}
            isLoading={loadingPacientes}
            clearButton
            paginate
            highlightOnlyResult
            filterBy={['numeroDocumento', 'nombreCompleto']}
            inputProps={{ className: 'notas-typeahead-input' }}
          />
        </div>

        {paciente && (
          <div className='notas-paciente-info'>
            <div className='info-strong'>{paciente.nombreCompleto}</div>
            <div className='info-muted'>
              Documento: <strong>{paciente.numeroDocumento}</strong>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Card tabla (sí puede cortar cosas internas, pero el scroll horizontal vive en wrapper) */}
      <div className='notas-card notas-card--table'>
        <h3 className='card-title'>Lista de Notas</h3>

        {loadingNotas ? (
          <div>Cargando notas...</div>
        ) : (
          <div className='table-wrapper'>
            <table className='notas-table'>
              <thead>
                <tr>
                  <th className='col-fecha'>Fecha</th>
                  <th className='col-pro hide-mobile'>Profesional</th>
                  <th className='col-acciones'>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {!paciente ? (
                  <tr>
                    <td colSpan={3} className='empty'>
                      Selecciona un paciente para ver sus notas.
                    </td>
                  </tr>
                ) : notas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='empty'>
                      No hay notas registradas para este paciente.
                    </td>
                  </tr>
                ) : (
                  notas.map((n) => (
                    <tr key={n._id}>
                      <td className='col-fecha'>{formatearFecha(n.fechaSesion || n.createdAt)}</td>
                      <td className='col-pro hide-mobile'>{n.profesional?.nombre || 'N/A'}</td>

                      <td className='col-acciones'>
                        <i
                          className='bi bi-eye text-primary'
                          title='Ver'
                          onClick={() => abrirDetalle(n)}
                        ></i>

                        <i
                          className='bi bi-pencil-square text-primary'
                          title='Editar'
                          onClick={() => abrirEditar(n)}
                        ></i>

                        <i
                          className='bi bi-x-circle text-danger'
                          title='Eliminar'
                          onClick={() => setConfirmId(n._id)}
                        ></i>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm delete (patrón Pacientes) */}
      {confirmId && (
        <div className='modal-overlay' role='dialog' aria-modal='true'>
          <div className='modal-box modal-confirm'>
            <div className='modal-header'>
              <h3 className='modal-title'>¿Eliminar nota?</h3>
              <button
                className='modal-close'
                onClick={() => setConfirmId(null)}
                aria-label='Cerrar'
              >
                ✕
              </button>
            </div>

            <div className='modal-body'>
              <p>Esta acción no se puede deshacer.</p>
            </div>

            <div className='modal-footer modal-actions'>
              <button className='btn-secondary' onClick={() => setConfirmId(null)} type='button'>
                Cancelar
              </button>

              <button className='btn-danger' onClick={handleDelete} type='button'>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      {showNuevaEditar && (
        <NuevaNotaModal
          show={showNuevaEditar}
          onHide={() => setShowNuevaEditar(false)}
          paciente={paciente}
          nota={notaSeleccionada}
          onSuccess={() => cargarNotas(paciente.numeroDocumento)}
        />
      )}

      {/* Modal ver detalle */}
      {showDetalle && (
        <NotaDetalle
          show={showDetalle}
          onHide={() => setShowDetalle(false)}
          nota={notaSeleccionada}
        />
      )}
    </div>
  );
}
