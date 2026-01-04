import { useState } from 'react';
import { changePasswordRequest } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';

export default function CambiarPassword() {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await changePasswordRequest(password);
      alert('Contraseña actualizada. Inicia sesión nuevamente.');
      logout();
    } catch (e) {
      alert('Error al cambiar la contraseña.');
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
          placeholder='Nueva contraseña (mín. 8 caracteres)'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={loading}>{loading ? 'Guardando...' : 'Actualizar contraseña'}</button>
      </form>
    </div>
  );
}
