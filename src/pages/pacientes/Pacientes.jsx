import { useEffect, useState } from 'react';
import { getPacientes, deletePaciente } from '../../api/pacientes';
import { useNavigate } from 'react-router-dom';
import NuevoPacienteModal from './NuevoPacienteModal';
import '../../styles/pacientes.scss';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const navigate = useNavigate();

  async function loadPacientes() {
    try {
      const res = await getPacientes();
      setPacientes(res.data);
    } catch (error) {
      console.error('Error al cargar pacientes', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPacientes();
  }, []);

  async function handleDelete() {
    try {
      await deletePaciente(confirmId);
      setConfirmId(null);
      loadPacientes();
    } catch (error) {
      console.error('Error eliminando paciente:', error);
      alert('Error eliminando paciente');
    }
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <div className='pacientes-page'>
      {/* Encabezado */}
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h2 className='page-title'>Pacientes</h2>

        <button className='btn-nueva-cita' onClick={() => setShowModal(true)}>
          <i className='bi bi-plus-circle'></i> Nuevo Paciente
        </button>
      </div>

      {/* Modal Crear */}
      {showModal && <NuevoPacienteModal close={() => setShowModal(false)} reload={loadPacientes} />}

      {/* Modal Confirmar Eliminar */}
      {confirmId && (
        <div className='modal-overlay'>
          <div className='confirm-modal'>
            <h3>¿Eliminar paciente?</h3>
            <p>Esta acción no se puede deshacer.</p>

            <div className='confirm-buttons'>
              <button className='btn-cancel' onClick={() => setConfirmId(null)}>
                Cancelar
              </button>

              <button className='btn-delete' onClick={handleDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLA estilo AGENDA */}
      <div className='pacientes-card'>
        <h3 className='card-title'>Lista de Pacientes</h3>

        <div className='table-wrapper'>
          <table className='pacientes-table'>
            <thead>
              <tr>
                <th>Nombre</th>
                <th className='hide-mobile'>Documento</th>
                {/* Teléfono oculto en mobile */}
                <th className='hide-mobile'>Teléfono</th>
                <th className='hide-mobile'>Email</th>
                <th className='acciones-header'>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pacientes.map((p) => (
                <tr key={p._id}>
                  <td>{p.nombreCompleto}</td>

                  <td className='hide-mobile'>{p.numeroDocumento}</td>

                  {/* Teléfono también con hide-mobile */}
                  <td className='hide-mobile'>{p.telefono || '-'}</td>

                  <td className='hide-mobile'>{p.email || '-'}</td>

                  <td className='actions'>
                    <i
                      className='bi bi-eye text-primary'
                      onClick={() => navigate(`/app/pacientes/${p._id}`)}
                    ></i>

                    <i
                      className='bi bi-pencil-square text-primary ms-3'
                      onClick={() => navigate(`/app/pacientes/${p._id}/editar`)}
                    ></i>

                    <i
                      className='bi bi-x-circle text-danger ms-3'
                      onClick={() => setConfirmId(p._id)}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
