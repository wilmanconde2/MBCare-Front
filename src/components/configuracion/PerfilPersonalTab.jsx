// src/components/configuracion/PerfilPersonalTab.jsx

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { updateMiNombreRequest } from '../../api/perfil.api';

export default function PerfilPersonalTab() {
  const { user, updateUserNombreLocal } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm({
    defaultValues: { nombre: user?.nombre || '' },
  });

  useEffect(() => {
    reset({ nombre: user?.nombre || '' });
  }, [user?.nombre, reset]);

  const onSubmit = async ({ nombre }) => {
    try {
      const value = (nombre || '').trim();
      if (!value) {
        await Swal.fire('Error', 'El nombre completo es obligatorio.', 'error');
        return;
      }

      await updateMiNombreRequest(value);
      updateUserNombreLocal(value);

      await Swal.fire('Listo', 'Nombre actualizado correctamente.', 'success');
    } catch (error) {
      await Swal.fire(
        'Error',
        error.response?.data?.message || 'No se pudo actualizar el nombre.',
        'error',
      );
    }
  };

  return (
    <div className='config-section'>
      <h4 className='config-section-title'>Perfil Personal</h4>

      <form className='config-form' onSubmit={handleSubmit(onSubmit)}>
        <div className='config-field'>
          <label className='config-label'>Nombre completo</label>
          <input className='config-input' placeholder='Nombre completo' {...register('nombre')} />
        </div>

        <div className='config-actions'>
          <button className='config-btn primary' disabled={isSubmitting} type='submit'>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
