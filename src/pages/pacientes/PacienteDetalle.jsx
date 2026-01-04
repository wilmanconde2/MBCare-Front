import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPacienteById } from '../../api/pacientes';

export default function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getPacienteById(id);
        setPaciente(res.data);
      } catch (err) {
        console.error('Error cargando paciente:', err);
        navigate('/app/pacientes');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  if (loading) return <div className='loading'>Cargando...</div>;
  if (!paciente) return <div>No encontrado</div>;

  return (
    <div className='paciente-detalle-page'>
      <div className='detalle-wrapper'>
        {/* HEADER */}
        <div className='detalle-header'>
          <h2>Detalle del Paciente</h2>
          <button className='close-x' onClick={() => navigate(-1)}>
            ✕
          </button>
        </div>

        {/* INFO GRID */}
        <div className='detalle-grid'>
          <div>
            <label>Nombre Completo</label>
            <p>{paciente.nombreCompleto}</p>
          </div>

          <div>
            <label>Documento</label>
            <p>{paciente.numeroDocumento || '-'}</p>
          </div>

          <div>
            <label>Fecha de Nacimiento</label>
            <p>{paciente.fechaNacimiento?.substring(0, 10) || '-'}</p>
          </div>

          <div>
            <label>Género</label>
            <p>{paciente.genero || '-'}</p>
          </div>

          <div>
            <label>Teléfono</label>
            <p>{paciente.telefono || '-'}</p>
          </div>

          <div>
            <label>Email</label>
            <p>{paciente.email || '-'}</p>
          </div>

          <div>
            <label>Dirección</label>
            <p>{paciente.direccion || '-'}</p>
          </div>

          <div className='full'>
            <label>Observaciones</label>
            <p className='detalle-observaciones'>{paciente.observaciones || '-'}</p>
          </div>
        </div>

        {/* ACCIONES */}
        <div className='detalle-actions'>
          <button className='btn-editar' onClick={() => navigate(`/app/pacientes/${id}/editar`)}>
            Editar Paciente
          </button>
        </div>
      </div>
    </div>
  );
}
