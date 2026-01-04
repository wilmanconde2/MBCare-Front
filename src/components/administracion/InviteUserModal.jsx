// src/components/administracion/InviteUserModal.jsx

import { useState } from 'react';

export default function InviteUserModal({ onClose, onSubmit, submitting }) {
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('Asistente');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return alert('Email requerido.');
    onSubmit({ email: email.trim(), rol });
  }

  return (
    <div className='admin-modal-backdrop' onClick={onClose}>
      <div className='admin-modal' onClick={(e) => e.stopPropagation()}>
        <div className='admin-modal-head'>
          <h3>Invitar Usuario</h3>
          <button className='admin-icon-btn' onClick={onClose} title='Cerrar'>
            <i className='bi bi-x-lg' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='admin-modal-body'>
          <label className='admin-label'>
            Email
            <input
              className='admin-input'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='correo@dominio.com'
              type='email'
            />
          </label>

          <label className='admin-label'>
            Rol inicial
            <select
              className='admin-role-select'
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value='Profesional'>Profesional</option>
              <option value='Asistente'>Asistente</option>
            </select>
          </label>

          <div className='admin-modal-actions'>
            <button type='button' className='admin-btn-ghost' onClick={onClose}>
              Cancelar
            </button>
            <button className='admin-btn' disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
