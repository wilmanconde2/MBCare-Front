import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPacienteById, updatePaciente } from '../../api/pacientes';

export default function PacienteEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombreCompleto: '',
    numeroDocumento: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    email: '',
    direccion: '',
    contactoEmergencia: '',
    telefonoEmergencia: '',
    observaciones: '',
  });

  // =====================================================
  // CARGAR PACIENTE
  // =====================================================
  useEffect(() => {
    async function loadPaciente() {
      try {
        const res = await getPacienteById(id);
        const p = res.data;

        setForm({
          nombreCompleto: p.nombreCompleto || '',
          numeroDocumento: p.numeroDocumento || '',
          fechaNacimiento: p.fechaNacimiento?.substring(0, 10) || '',
          genero: p.genero || '',
          telefono: p.telefono || '',
          email: p.email || '',
          direccion: p.direccion || '',
          contactoEmergencia: p.contactoEmergencia || '',
          telefonoEmergencia: p.telefonoEmergencia || '',
          observaciones: p.observaciones || '',
        });
      } catch (error) {
        console.error('Error cargando paciente:', error);
        navigate('/app/pacientes');
      } finally {
        setLoading(false);
      }
    }

    loadPaciente();
  }, [id, navigate]);

  // =====================================================
  // HANDLERS
  // =====================================================
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updatePaciente(id, form);
      navigate('/app/pacientes');
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  }

  if (loading) return <div className='loading'>Cargando...</div>;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className='paciente-editar-page'>
      <div className='editar-wrapper'>
        {/* HEADER */}
        <div className='modal-header'>
          <h2>Editar Paciente</h2>
          <button className='close-x' onClick={() => navigate(-1)}>
            ✕
          </button>
        </div>

        {/* FORM */}
        <form className='form-grid' onSubmit={handleSubmit}>
          <div>
            <label>Nombre Completo *</label>
            <input
              type='text'
              name='nombreCompleto'
              value={form.nombreCompleto}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Número de Documento *</label>
            <input
              type='text'
              name='numeroDocumento'
              value={form.numeroDocumento}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Fecha de Nacimiento</label>
            <input
              type='date'
              name='fechaNacimiento'
              value={form.fechaNacimiento}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Género</label>
            <input type='text' name='genero' value={form.genero} onChange={handleChange} />
          </div>

          <div>
            <label>Teléfono</label>
            <input type='text' name='telefono' value={form.telefono} onChange={handleChange} />
          </div>

          <div>
            <label>Email</label>
            <input type='email' name='email' value={form.email} onChange={handleChange} />
          </div>

          <div>
            <label>Dirección</label>
            <input type='text' name='direccion' value={form.direccion} onChange={handleChange} />
          </div>

          <div>
            <label>Contacto de Emergencia</label>
            <input
              type='text'
              name='contactoEmergencia'
              value={form.contactoEmergencia}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Teléfono de Emergencia</label>
            <input
              type='text'
              name='telefonoEmergencia'
              value={form.telefonoEmergencia}
              onChange={handleChange}
            />
          </div>

          <div className='col-2'>
            <label>Observaciones</label>
            <textarea
              name='observaciones'
              value={form.observaciones}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className='actions'>
            <button type='button' className='cancelar' onClick={() => navigate(-1)}>
              Cancelar
            </button>

            <button type='submit' className='crear'>
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
