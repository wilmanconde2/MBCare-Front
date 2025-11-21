import { useEffect, useState } from 'react';
import { getPacientes, deletePaciente } from '../../api/pacientes';
import { useNavigate } from 'react-router-dom';
import NuevoPacienteModal from './NuevoPacienteModal';

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
    } catch {
      console.error('Error al cargar pacientes');
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
      <h2 className='page-title'>Pacientes</h2>

      <div className='top-actions'>
        <button className='btn-new' onClick={() => setShowModal(true)}>
          <i className='bi bi-plus-lg'></i>
          Nuevo Paciente
        </button>
      </div>

      {showModal && <NuevoPacienteModal close={() => setShowModal(false)} reload={loadPacientes} />}

      {/* MODAL CONFIRMAR ELIMINAR */}
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

      <div className='pacientes-card'>
        <h3 className='card-title'>Lista de Pacientes</h3>

        <div className='table-wrapper'>
          <table className='pacientes-table'>
            <thead>
              <tr>
                <th>Nombre</th>
                <th className='hide-mobile'>Documento</th>
                <th>Teléfono</th>
                <th className='hide-mobile'>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pacientes.map((p) => (
                <tr key={p._id}>
                  <td>{p.nombreCompleto}</td>
                  <td className='hide-mobile'>{p.numeroDocumento}</td>
                  <td>{p.telefono || '-'}</td>
                  <td className='hide-mobile'>{p.email || '-'}</td>

                  <td className='actions'>
                    <i
                      className='bi bi-eye view'
                      onClick={() => navigate(`/app/pacientes/${p._id}`)}
                    ></i>

                    <i
                      className='bi bi-pencil edit'
                      onClick={() => navigate(`/app/pacientes/${p._id}/editar`)}
                    ></i>

                    <i className='bi bi-trash delete' onClick={() => setConfirmId(p._id)}></i>
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
