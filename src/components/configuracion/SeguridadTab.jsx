// src/components/configuracion/SeguridadTab.jsx

import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { changePasswordRequest } from '../../api/auth.api';

export default function SeguridadTab() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      if (!data.currentPassword || !data.newPassword) {
        await Swal.fire('Error', 'Completa contraseña actual y nueva contraseña.', 'error');
        return;
      }

      if (data.newPassword.length < 8) {
        await Swal.fire('Error', 'La nueva contraseña debe tener al menos 8 caracteres.', 'error');
        return;
      }

      if (data.confirmPassword && data.confirmPassword !== data.newPassword) {
        await Swal.fire('Error', 'La confirmación no coincide.', 'error');
        return;
      }

      await changePasswordRequest({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      reset();

      await Swal.fire('Listo', 'Contraseña actualizada exitosamente.', 'success');
    } catch (error) {
      await Swal.fire(
        'Error',
        error.response?.data?.message || 'No se pudo actualizar la contraseña.',
        'error',
      );
    }
  };

  return (
    <div className='config-section'>
      <h4 className='config-section-title'>Seguridad</h4>

      <form className='config-form' onSubmit={handleSubmit(onSubmit)}>
        <div className='config-field'>
          <label className='config-label'>Contraseña actual</label>
          <input
            type='password'
            className='config-input'
            placeholder='Contraseña actual'
            {...register('currentPassword')}
          />
        </div>

        <div className='config-field'>
          <label className='config-label'>Nueva contraseña</label>
          <input
            type='password'
            className='config-input'
            placeholder='Nueva contraseña (mínimo 8 caracteres)'
            {...register('newPassword')}
          />
        </div>

        <div className='config-field'>
          <label className='config-label'>Confirmar nueva contraseña</label>
          <input
            type='password'
            className='config-input'
            placeholder='Confirmar nueva contraseña'
            {...register('confirmPassword')}
          />
        </div>

        <div className='config-actions'>
          <button className='config-btn primary' disabled={isSubmitting} type='submit'>
            {isSubmitting ? 'Guardando...' : 'Actualizar Contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
}
