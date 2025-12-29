import { useEffect, useState } from 'react';
import { getPacientes, deletePaciente } from '../../api/pacientes';
import { useNavigate } from 'react-router-dom';
import NuevoPacienteModal from './NuevoPacienteModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
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

  // ✅ Bloquear scroll del body cuando haya modal abierto
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
      <div className='pacientes-header'>
        <h2 className='page-title'>Pacientes</h2>

        <button className='btn-primary-action' onClick={() => setShowModal(true)} type='button'>
          <i className='bi bi-plus-circle'></i> Nuevo Paciente
        </button>
      </div>

      <NuevoPacienteModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSuccess={loadPacientes}
      />

      <ConfirmModal
        open={!!confirmId}
        title='Eliminar paciente'
        subtitle='Esta acción no se puede deshacer.'
        message='Se eliminará el paciente y sus datos asociados (si aplica). ¿Deseas continuar?'
        confirmText='Eliminar'
        cancelText='Cancelar'
        confirmIconClass='bi bi-trash3'
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />

      <div className='pacientes-card'>
        <h3 className='card-title'>Lista de Pacientes</h3>

        <div className='table-wrapper'>
          <table className='pacientes-table'>
            <thead>
              <tr>
                <th>Nombre</th>
                <th className='hide-mobile doc-col'>Documento</th>
                <th className='hide-mobile'>Teléfono</th>
                <th className='hide-mobile'>Email</th>
                <th className='acciones-header'>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pacientes.map((p) => (
                <tr key={p._id}>
                  <td className='td-main'>
                    {p.nombreCompleto}
                    <br />
                    <small className='text-muted paciente-doc-mobile'>
                      {p.numeroDocumento || '-'}
                    </small>
                  </td>

                  <td className='hide-mobile doc-col'>{p.numeroDocumento}</td>
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
