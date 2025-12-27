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

  useEffect(() => {
    if (!confirmId) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setConfirmId(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmId]);

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

        <button className='btn-primary-action' onClick={() => setShowModal(true)} type='button'>
          <i className='bi bi-plus-circle'></i> Nuevo Paciente
        </button>
      </div>

      {/* Modal Crear (Bootstrap) */}
      <NuevoPacienteModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSuccess={loadPacientes}
      />

      {/* Modal Confirmar Eliminar */}
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
                      Eliminar paciente
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
                  <p>
                    Se eliminará el paciente y sus datos asociados (si aplica). ¿Deseas continuar?
                  </p>
                </div>
              </div>

              <div className='cm-footer'>
                <button
                  className='cm-btn cm-btn-ghost'
                  onClick={() => setConfirmId(null)}
                  type='button'
                >
                  Cancelar
                </button>

                <button className='cm-btn cm-btn-danger' onClick={handleDelete} type='button'>
                  <i className='bi bi-trash3'></i>
                  Eliminar
                </button>
              </div>
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
                <th className='hide-mobile doc-col'>Documento</th>
                <th className='hide-mobile'>Teléfono</th>
                <th className='hide-mobile'>Email</th>
                <th className='acciones-header'>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pacientes.map((p) => (
                <tr key={p._id}>
                  {/* ✅ En mobile: Nombre + Documento debajo (igual Agenda) */}
                  <td className='td-main'>
                    {p.nombreCompleto}
                    <br />
                    <small className='text-muted paciente-doc-mobile'>
                      {p.numeroDocumento || '-'}
                    </small>
                  </td>

                  {/* ✅ En desktop: columna documento normal */}
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
