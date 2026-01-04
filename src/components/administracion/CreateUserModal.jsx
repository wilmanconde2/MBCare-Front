// src/components/administracion/CreateUserModal.jsx

import { useState } from 'react';

export default function CreateUserModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Asistente',
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className='admin-modal-backdrop' onClick={onClose}>
      <form className='admin-modal' onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className='admin-modal-head'>
          <h3 className='card-title' style={{ margin: 0 }}>
            Crear usuario
          </h3>

          <button type='button' className='admin-icon-btn' onClick={onClose} aria-label='Cerrar'>
            <i className='bi bi-x-lg'></i>
          </button>
        </div>

        <p className='admin-muted' style={{ marginTop: 8 }}>
          El usuario recibirá credenciales temporales y deberá cambiar la contraseña en su primer
          ingreso.
        </p>

        <div className='admin-modal-body'>
          <label className='admin-label'>
            Email*
            <input
              className='admin-input'
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder='usuario@ejemplo.com'
            />
          </label>

          <label className='admin-label'>
            Nombre completo*
            <input
              className='admin-input'
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder='Juan Pérez'
            />
          </label>

          <label className='admin-label'>
            Contraseña temporal*
            <input
              className='admin-input'
              type='password'
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder='Mínimo 8 caracteres'
            />
          </label>

          <label className='admin-label'>
            Rol*
            <select
              className='admin-role-select'
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
            >
              <option value='Profesional'>Profesional</option>
              <option value='Asistente'>Asistente</option>
            </select>
          </label>
        </div>

        <div className='admin-modal-actions'>
          <button type='button' className='admin-btn-ghost' onClick={onClose}>
            Cancelar
          </button>
          <button className='admin-btn' type='submit'>
            Crear usuario
          </button>
        </div>
      </form>
    </div>
  );
}
