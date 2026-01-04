// mbcare_frontend/src/pages/auth/CambiarPassword.jsx

import { useState } from 'react';
import { changePasswordRequest } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';

export default function CambiarPassword() {
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      alert('Debes ingresar tu contraseña actual y la nueva contraseña.');
      return;
    }

    if (newPassword.length < 8) {
      alert('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (confirmPassword && confirmPassword !== newPassword) {
      alert('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setLoading(true);
    try {
      await changePasswordRequest({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      alert('Contraseña actualizada. Inicia sesión nuevamente.');
      logout();
    } catch (e) {
      alert(e.response?.data?.message || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='auth-change'>
      <form className='auth-change-card' onSubmit={handleSubmit}>
        <h1>Cambiar contraseña</h1>
        <p>Por seguridad, debes cambiar tu contraseña antes de continuar.</p>

        <input
          type='password'
          placeholder='Contraseña actual'
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          type='password'
          placeholder='Nueva contraseña (mín. 8 caracteres)'
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type='password'
          placeholder='Confirmar nueva contraseña'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button disabled={loading}>{loading ? 'Guardando...' : 'Actualizar contraseña'}</button>
      </form>
    </div>
  );
}
