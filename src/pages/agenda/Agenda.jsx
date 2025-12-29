import { useEffect, useRef, useState } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { obtenerCitas, cancelarCita } from '../../api/citas';
import NuevaCitaModal from './NuevaCitaModal';
import EditarCita from './EditarCita';
import ConfirmModal from '../../components/ui/ConfirmModal';
import '../../styles/agenda.scss';

const Agenda = () => {
  const [citas, setCitas] = useState([]);
  const [showNueva, setShowNueva] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

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

      <ConfirmModal
        open={!!confirmId}
        title='Cancelar cita'
        subtitle='Esta acción no se puede deshacer.'
        message='Se cancelará la cita seleccionada. ¿Deseas continuar?'
        confirmText='Cancelar'
        cancelText='Volver'
        confirmIconClass='bi bi-x-circle'
        onClose={() => setConfirmId(null)}
        onConfirm={handleCancelarConfirmado}
      />

      {showNueva && (
        <NuevaCitaModal
          show={showNueva}
          onHide={() => setShowNueva(false)}
          onSuccess={cargarCitas}
        />
      )}

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
