import { useState } from 'react';
import { createPaciente } from '../../api/pacientes';

export default function NuevoPacienteModal({ close, reload }) {
  const [form, setForm] = useState({
    nombreCompleto: '',
    tipoDocumento: 'CC',
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createPaciente(form);
      reload();
      close();
    } catch (err) {
      console.error('Error creando paciente:', err);
      alert('Error creando paciente');
    }
  }

  return (
    <div className='modal-overlay'>
      <div className='paciente-modal'>
        <div className='modal-header'>
          <h3>Nuevo Paciente</h3>
          <button className='close-x' onClick={close}>
            <i className='bi bi-x-lg'></i>
          </button>
        </div>

        <form className='modal-form' onSubmit={handleSubmit}>
          <div className='form-grid'>
            {/* Nombre */}
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

            {/* Tipo documento */}
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

            {/* Documento */}
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

            {/* Fecha nacimiento */}
            <div>
              <label>Fecha de Nacimiento</label>
              <input
                type='date'
                name='fechaNacimiento'
                value={form.fechaNacimiento}
                onChange={handleChange}
              />
            </div>

            {/* Género */}
            <div>
              <label>Género</label>
              <select name='genero' value={form.genero} onChange={handleChange}>
                <option value=''>Seleccione</option>
                <option value='Masculino'>Masculino</option>
                <option value='Femenino'>Femenino</option>
                <option value='Otro'>Otro</option>
              </select>
            </div>

            {/* Teléfono */}
            <div>
              <label>Teléfono</label>
              <input type='text' name='telefono' value={form.telefono} onChange={handleChange} />
            </div>

            {/* Email */}
            <div className='full'>
              <label>Email</label>
              <input type='email' name='email' value={form.email} onChange={handleChange} />
            </div>

            {/* Dirección */}
            <div className='full'>
              <label>Dirección</label>
              <input type='text' name='direccion' value={form.direccion} onChange={handleChange} />
            </div>

            {/* Contacto Emergencia */}
            <div>
              <label>Contacto Emergencia</label>
              <input
                type='text'
                name='contactoEmergencia'
                value={form.contactoEmergencia}
                onChange={handleChange}
              />
            </div>

            {/* Teléfono Emergencia */}
            <div>
              <label>Teléfono Emergencia</label>
              <input
                type='text'
                name='telefonoEmergencia'
                value={form.telefonoEmergencia}
                onChange={handleChange}
              />
            </div>

            {/* Observaciones */}
            <div className='full'>
              <label>Observaciones</label>
              <textarea
                rows='3'
                name='observaciones'
                value={form.observaciones}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className='modal-buttons'>
            <button type='button' className='btn-cancel' onClick={close}>
              Cancelar
            </button>
            <button type='submit' className='btn-create'>
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
