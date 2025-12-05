import { useEffect, useState } from 'react';
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

  const handleCancelar = async (id) => {
    await cancelarCita(id);
    cargarCitas();
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  return (
    <div className='agenda-page'>
      <div className='d-flex justify-content-between align-items-center'>
        <h2>Agenda de Citas</h2>

        <Button className='btn-nueva-cita' onClick={() => setShowNueva(true)}>
          <i className='bi bi-plus-circle'></i> Nueva Cita
        </Button>
      </div>

      <div className='agenda-card'>
        <div className='agenda-title'>Lista de Citas</div>

        <Table hover responsive className='tabla-citas'>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Profesional</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {citas.map((cita) => (
              <tr key={cita._id}>
                <td>{formatearFecha(cita.fecha)}</td>

                <td>
                  {cita.paciente?.nombreCompleto}
                  <br />
                  <small className='text-muted'>{cita.paciente?.numeroDocumento}</small>
                </td>

                <td>{cita.profesional?.nombre}</td>

                <td>{cita.tipo}</td>

                <td>
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

                <td className='acciones'>
                  <i
                    className='bi bi-pencil-square text-primary'
                    onClick={() => abrirEditar(cita)}
                  ></i>

                  <i
                    className='bi bi-x-circle text-danger ms-3'
                    onClick={() => handleCancelar(cita._id)}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

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
