export default function NuevoPacienteModal({ close }) {
  return (
    <div className='modal-overlay'>
      <div className='paciente-modal'>
        <div className='modal-header'>
          <h3>Nuevo Paciente</h3>
          <button className='close-x' onClick={close}>
            <i className='bi bi-x-lg'></i>
          </button>
        </div>

        <form className='modal-form'>
          <div className='form-grid'>
            <div>
              <label>Nombres *</label>
              <input type='text' />
            </div>

            <div>
              <label>Apellidos *</label>
              <input type='text' />
            </div>

            <div>
              <label>Identificación</label>
              <input type='text' />
            </div>

            <div>
              <label>Fecha de Nacimiento</label>
              <input type='date' />
            </div>

            <div>
              <label>Género</label>
              <input type='text' />
            </div>

            <div>
              <label>Teléfono</label>
              <input type='text' />
            </div>

            <div className='full'>
              <label>Email</label>
              <input type='email' />
            </div>

            <div className='full'>
              <label>Dirección</label>
              <input type='text' />
            </div>

            <div>
              <label>Contacto de Emergencia</label>
              <input type='text' />
            </div>

            <div>
              <label>Teléfono de Emergencia</label>
              <input type='text' />
            </div>

            <div className='full'>
              <label>Notas</label>
              <textarea rows='3'></textarea>
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
