// mbcare_frontend/src/pages/pacientes/PacienteEditar.jsx

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPacienteById, updatePaciente } from '../../api/pacientes';

const ESTADOS_CIVILES = [
  'Soltero',
  'Casado',
  'Unión libre',
  'Separado',
  'Divorciado',
  'Viudo',
  'Otro',
];

function normalizePacientePayload(form) {
  const payload = { ...form };

  for (const k of ['pesoKg', 'alturaCm']) {
    const v = payload[k];
    if (v === '' || v === null || v === undefined) {
      delete payload[k];
      continue;
    }
    const n = Number(v);
    if (Number.isNaN(n)) delete payload[k];
    else payload[k] = n;
  }

  Object.keys(payload).forEach((k) => {
    if (payload[k] === '') delete payload[k];
  });

  return payload;
}

export default function PacienteEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombreCompleto: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    email: '',
    direccion: '',

    ocupacion: '',
    estadoCivil: '',

    pesoKg: '',
    alturaCm: '',
    alergias: '',
    lesiones: '',
    operaciones: '',
    razonVisita: '',
    valoracion: '',

    observaciones: '',
  });

  useEffect(() => {
    async function loadPaciente() {
      try {
        const res = await getPacienteById(id);
        const p = res.data;

        setForm({
          nombreCompleto: p.nombreCompleto || '',
          tipoDocumento: p.tipoDocumento || 'CC',
          numeroDocumento: p.numeroDocumento || '',
          fechaNacimiento: p.fechaNacimiento?.substring(0, 10) || '',
          genero: p.genero || '',
          telefono: p.telefono || '',
          email: p.email || '',
          direccion: p.direccion || '',

          ocupacion: p.ocupacion || '',
          estadoCivil: p.estadoCivil || '',

          pesoKg: p.pesoKg ?? '',
          alturaCm: p.alturaCm ?? '',
          alergias: p.alergias || '',
          lesiones: p.lesiones || '',
          operaciones: p.operaciones || '',
          razonVisita: p.razonVisita || '',
          valoracion: p.valoracion || '',

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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = normalizePacientePayload(form);
      await updatePaciente(id, payload);
      navigate('/app/pacientes');
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  }

  if (loading) return <div className='loading'>Cargando...</div>;

  return (
    <div className='paciente-editar-page'>
      <div className='editar-wrapper'>
        <div className='modal-header'>
          <h2>Editar Paciente</h2>
          <button className='close-x' onClick={() => navigate(-1)}>
            ✕
          </button>
        </div>

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
            <label>Tipo Documento *</label>
            <select name='tipoDocumento' value={form.tipoDocumento} onChange={handleChange}>
              <option value='CC'>CC</option>
              <option value='TI'>TI</option>
              <option value='CE'>CE</option>
              <option value='Pasaporte'>Pasaporte</option>
              <option value='Otro'>Otro</option>
            </select>
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
            <select name='genero' value={form.genero} onChange={handleChange}>
              <option value=''>Seleccione</option>
              <option value='Masculino'>Masculino</option>
              <option value='Femenino'>Femenino</option>
              <option value='Otro'>Otro</option>
            </select>
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
            <label>Ocupación</label>
            <input type='text' name='ocupacion' value={form.ocupacion} onChange={handleChange} />
          </div>

          <div>
            <label>Estado civil</label>
            <select name='estadoCivil' value={form.estadoCivil} onChange={handleChange}>
              <option value=''>Seleccione</option>
              {ESTADOS_CIVILES.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Peso (kg)</label>
            <input
              type='number'
              name='pesoKg'
              value={form.pesoKg}
              onChange={handleChange}
              min='0'
              step='0.1'
            />
          </div>

          <div>
            <label>Altura (cm)</label>
            <input
              type='number'
              name='alturaCm'
              value={form.alturaCm}
              onChange={handleChange}
              min='0'
              step='1'
            />
          </div>

          <div className='full'>
            <label>Alergias</label>
            <textarea name='alergias' value={form.alergias} onChange={handleChange}></textarea>
          </div>

          <div className='full'>
            <label>Lesiones</label>
            <textarea name='lesiones' value={form.lesiones} onChange={handleChange}></textarea>
          </div>

          <div className='full'>
            <label>Operaciones</label>
            <textarea
              name='operaciones'
              value={form.operaciones}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className='full'>
            <label>Razón de la visita</label>
            <textarea
              name='razonVisita'
              value={form.razonVisita}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className='full'>
            <label>Valoración</label>
            <textarea name='valoracion' value={form.valoracion} onChange={handleChange}></textarea>
          </div>

          <div className='full'>
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
