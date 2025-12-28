import { useEffect, useRef, useState } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { obtenerCitas, cancelarCita } from '../../api/citas';
import NuevaCitaModal from './NuevaCitaModal';
import EditarCita from './EditarCita';
import '../../styles/agenda.scss';

const Agenda = () => {
  const [citas, setCitas] = useState([]);
  const [showNueva, setShowNueva] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // Confirm modal
  const [confirmId, setConfirmId] = useState(null);

  const cargarCitas = async () => {
    const data = await obtenerCitas();
    setCitas(data?.citas || []);
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const abrirEditar = (cita) => {
    setCitaSeleccionada(cita);
    setShowEditar(true);
  };

  // Bloqueo de scroll (mismo patrón que el resto de la app)
  const initialBodyOverflowRef = useRef('');

  useEffect(() => {
    initialBodyOverflowRef.current = document.body.style.overflow || '';
    return () => {
      document.body.style.overflow = initialBodyOverflowRef.current;
    };
  }, []);

  useEffect(() => {
    const hasModalOpen = Boolean(confirmId) || showNueva || showEditar;
    document.body.style.overflow = hasModalOpen ? 'hidden' : initialBodyOverflowRef.current;

    return () => {
      document.body.style.overflow = initialBodyOverflowRef.current;
    };
  }, [confirmId, showNueva, showEditar]);

  // ESC para cerrar confirm
  useEffect(() => {
    if (!confirmId) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setConfirmId(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmId]);

  const handleCancelarConfirmado = async () => {
    try {
      await cancelarCita(confirmId);
      setConfirmId(null);
      cargarCitas();
    } catch (e) {
      console.error('Error cancelando cita:', e);
      alert(e?.response?.data?.message || 'Error cancelando cita');
    }
  };

  // ✅ Fecha y hora separadas (para mobile: hora debajo)
  const formatearFechaUI = (fecha) => {
    const d = new Date(fecha);
    const dia = d.toLocaleDateString('es-CO', { dateStyle: 'short' });
    const hora = d.toLocaleTimeString('es-CO', { timeStyle: 'short' });
    return { dia, hora };
  };

  return (
    <div className='agenda-page'>
      <div className='agenda-header'>
        <h2 className='page-title'>Agenda de Citas</h2>

        <Button className='btn-nueva-cita' onClick={() => setShowNueva(true)} type='button'>
          <i className='bi bi-plus-circle'></i> Nueva Cita
        </Button>
      </div>

      <div className='agenda-card'>
        <div className='agenda-title'>Lista de Citas</div>

        <div className='table-wrapper'>
          <Table hover responsive className='tabla-citas'>
            <thead>
              <tr>
                <th className='col-fecha'>Fecha</th>
                <th className='col-paciente'>Paciente</th>

                {/* ✅ Ocultas en mobile */}
                <th className='hide-mobile'>Profesional</th>
                <th className='hide-mobile'>Tipo</th>

                <th className='col-estado'>Estado</th>
                <th className='th-acciones col-acciones'>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {citas.map((cita) => {
                const { dia, hora } = formatearFechaUI(cita.fecha);

                return (
                  <tr key={cita._id}>
                    <td className='col-fecha'>
                      <span className='fecha-dia'>{dia}</span>
                      <span className='fecha-hora'>{hora}</span>
                    </td>

                    <td className='col-paciente'>
                      {cita.paciente?.nombreCompleto}
                      <br />
                      <small className='text-muted'>{cita.paciente?.numeroDocumento}</small>
                    </td>

                    {/* ✅ Ocultas en mobile */}
                    <td className='hide-mobile'>{cita.profesional?.nombre}</td>
                    <td className='hide-mobile'>{cita.tipo}</td>

                    <td className='col-estado'>
                      <Badge
                        bg={
                          cita.estado === 'Cancelada'
                            ? 'danger'
                            : cita.estado === 'Completada'
                            ? 'success'
                            : 'primary'
                        }
                      >
                        {cita.estado}
                      </Badge>
                    </td>

                    <td className='acciones col-acciones'>
                      <i
                        className='bi bi-pencil-square text-primary'
                        title='Editar'
                        onClick={() => abrirEditar(cita)}
                      ></i>

                      {/* Mostrar cancelar SOLO si está Programada */}
                      {cita.estado === 'Programada' && (
                        <i
                          className='bi bi-x-circle text-danger ms-1'
                          title='Cancelar'
                          onClick={() => setConfirmId(cita._id)}
                        ></i>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!citas.length && (
                <tr>
                  <td colSpan={6} className='empty'>
                    No hay citas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Confirm cancelar */}
      {confirmId && (
        <div
          className='confirm-modal'
          role='dialog'
          aria-modal='true'
          aria-labelledby='confirm-title'
        >
          <div
            className='cm-overlay'
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setConfirmId(null);
            }}
          >
            <div className='cm-box cm-pop' role='document'>
              <div className='cm-header'>
                <div className='cm-header-left'>
                  <span className='cm-icon' aria-hidden='true'>
                    <i className='bi bi-exclamation-triangle-fill'></i>
                  </span>
                  <div>
                    <h3 id='confirm-title' className='cm-title'>
                      Cancelar cita
                    </h3>
                    <p className='cm-subtitle'>Esta acción no se puede deshacer.</p>
                  </div>
                </div>

                <button
                  className='cm-close'
                  onClick={() => setConfirmId(null)}
                  aria-label='Cerrar'
                  type='button'
                >
                  <i className='bi bi-x'></i>
                </button>
              </div>

              <div className='cm-body'>
                <div className='cm-callout'>
                  <div className='cm-dot' />
                  <p>Se cancelará la cita seleccionada. ¿Deseas continuar?</p>
                </div>
              </div>

              <div className='cm-footer'>
                <button
                  className='cm-btn cm-btn-ghost'
                  onClick={() => setConfirmId(null)}
                  type='button'
                >
                  Volver
                </button>

                <button
                  className='cm-btn cm-btn-danger'
                  onClick={handleCancelarConfirmado}
                  type='button'
                >
                  <i className='bi bi-x-circle'></i>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear */}
      {showNueva && (
        <NuevaCitaModal
          show={showNueva}
          onHide={() => setShowNueva(false)}
          onSuccess={cargarCitas}
        />
      )}

      {/* Modal Editar */}
      {showEditar && (
        <EditarCita
          show={showEditar}
          onHide={() => setShowEditar(false)}
          cita={citaSeleccionada}
          onSuccess={cargarCitas}
        />
      )}
    </div>
  );
};

export default Agenda;
