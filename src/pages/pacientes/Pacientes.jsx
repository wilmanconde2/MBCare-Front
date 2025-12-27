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

  // ✅ Opción A: bloquear scroll del body cuando haya modal abierto
  useEffect(() => {
    const hasModalOpen = showModal || !!confirmId;

    if (hasModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [showModal, confirmId]);

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
      <div className='pacientes-header'>
        <h2 className='page-title'>Pacientes</h2>

        <button className='btn-primary-action' onClick={() => setShowModal(true)}>
          <i className='bi bi-plus-circle'></i> Nuevo Paciente
        </button>
      </div>

      {/* ✅ Modal Crear (Bootstrap) */}
      <NuevoPacienteModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSuccess={loadPacientes}
      />

      {/* Modal Confirmar Eliminar (tu overlay actual) */}
      {confirmId && (
        <div className='modal-overlay' role='dialog' aria-modal='true'>
          <div className='modal-box modal-confirm'>
            <div className='modal-header'>
              <h3 className='modal-title'>¿Eliminar paciente?</h3>
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
              <button className='btn-secondary' onClick={() => setConfirmId(null)}>
                Cancelar
              </button>

              <button className='btn-danger' onClick={handleDelete}>
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
                <th className='hide-mobile'>Teléfono</th>
                <th className='hide-mobile'>Email</th>
                <th className='acciones-header'>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pacientes.map((p) => (
                <tr key={p._id}>
                  <td className='td-main'>{p.nombreCompleto}</td>

                  <td className='hide-mobile'>{p.numeroDocumento}</td>

                  <td className='hide-mobile'>{p.telefono || '-'}</td>

                  <td className='hide-mobile'>{p.email || '-'}</td>

                  <td className='actions'>
                    <i
                      className='bi bi-eye text-primary'
                      onClick={() => navigate(`/app/pacientes/${p._id}`)}
                      title='Ver'
                    ></i>

                    <i
                      className='bi bi-pencil-square text-primary ms-3'
                      onClick={() => navigate(`/app/pacientes/${p._id}/editar`)}
                      title='Editar'
                    ></i>

                    <i
                      className='bi bi-x-circle text-danger ms-3'
                      onClick={() => setConfirmId(p._id)}
                      title='Eliminar'
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!pacientes.length && <p className='empty-state'>No hay pacientes registrados.</p>}
      </div>
    </div>
  );
}
